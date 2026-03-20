console.log("Job Portal Auto Apply Content Script Loaded!");

let isApplying = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "START_APPLY") {
    if (isApplying) {
        alert("Already applying!");
        sendResponse({ status: 'running' });
        return;
    }
    console.log("Starting Auto Apply Sequence...");
    isApplying = true;
    startAutoApply(request.userId);
    sendResponse({ status: 'started' });
  }
});

function getVisibleText(el) {
    if (!el) return "";
    return el.innerText || el.textContent || "";
}

async function startAutoApply(userId) {
   console.log("Looking for Easy Apply button...");
   let easyApplyButton = null;
   
   // Poll for up to 10 seconds (20 tries * 500ms)
   for (let i = 0; i < 20; i++) {
       // Look for the specific LinkedIn class, or ARIA label, ignoring tag type
       const applyElements = Array.from(document.querySelectorAll('.jobs-apply-button, [aria-label*="Easy Apply" i], button'));
       
       for (const el of applyElements) {
           // Skip hidden elements
           if (el.offsetWidth === 0 && el.offsetHeight === 0) continue;
           
           const isApplyClass = el.classList && el.classList.contains('jobs-apply-button');
           const btnText = getVisibleText(el).toLowerCase();
           
           // Extra safety: only click the large one in the main job description panel if we're on the search page
           const isInMainPanel = el.closest('.job-view-layout') || el.closest('.jobs-search__job-details--container');
           
           if (isApplyClass || btnText.includes('easy apply')) {
               // If we are on a split-pane view, prefer the button inside the details pane!
               if (isInMainPanel || document.querySelectorAll('.jobs-apply-button').length === 1) {
                   easyApplyButton = el;
                   break;
               } else if (!easyApplyButton) {
                   // Fallback to the first one found if not in main pane but we have no other choice
                   easyApplyButton = el;
               }
           }
       }
       if (easyApplyButton) {
           break;
       }
       await new Promise(r => setTimeout(r, 500));
   }

   if (!easyApplyButton) {
      alert("No Easy Apply button available for this job. Make sure the job actually says 'Easy Apply' and not just 'Apply'!");
      isApplying = false;
      return;
   }
   
   console.log("Clicking Easy Apply...");
   easyApplyButton.click();
   
   await new Promise(r => setTimeout(r, 2000));
   await handleModal(userId);
}

async function handleModal(userId) {
    const maxPages = 15;
    for (let i = 0; i < maxPages; i++) {
        await new Promise(r => setTimeout(r, 2000));

        // 1. Check for Submit button first
        const buttons = Array.from(document.querySelectorAll('button'));
        const submitBtn = buttons.find(b => getVisibleText(b).toLowerCase().includes('submit application'));
        
        if (submitBtn) {
            console.log("Found Submit button! Clicking it.");
            submitBtn.click();
            await new Promise(r => setTimeout(r, 3000));
            // Close success modal
            const dismissBtns = Array.from(document.querySelectorAll('button')).find(b => {
                const text = getVisibleText(b).toLowerCase();
                return text.includes('dismiss') || text.includes('done');
            });
            if (dismissBtns) dismissBtns.click();
            
            isApplying = false;
            return;
        }

        // 2. Not submitting yet. Gather form fields!
        const nextBtn = buttons.find(b => {
           const text = getVisibleText(b).toLowerCase();
           return text.includes('next') || text.includes('review');
        });

        if (!nextBtn) {
            console.log("No Next or Submit button. Modal might be missing or stuck. Discarding.");
            discardApplication();
            return;
        }

        console.log(`Checking page ${i + 1} for questions...`);
        const questions = gatherFormQuestions();
        
        if (questions.length > 0) {
            console.log(`Found ${questions.length} questions. Requesting AI answers...`);
            const answers = await fetchAnswersFromAPI(userId, questions);
            if (answers) {
                 fillFormAnswers(questions, answers);
            }
        }
        
        // Click Next
        console.log("Clicking Next...");
        nextBtn.click();
        await new Promise(r => setTimeout(r, 1000));
    }
    
    console.log("Hit max pages, discarding.");
    discardApplication();
}

function setReactValue(element, value) {
    let lastValue = element.value;
    element.value = value;
    let event = new Event("input", { target: element, bubbles: true });
    // React 15
    event.simulated = true;
    // React 16+
    let tracker = element._valueTracker;
    if (tracker) {
        tracker.setValue(lastValue);
    }
    element.dispatchEvent(event);
    element.dispatchEvent(new Event("change", { bubbles: true }));
}

function gatherFormQuestions() {
    const data = [];
    
    // 1. Text Inputs
    const textInputs = document.querySelectorAll('input[type="text"], input[type="number"]');
    textInputs.forEach(inp => {
        if (!inp.value && !inp.hidden && !inp.disabled) {
            const label = document.querySelector(`label[for="${inp.id}"]`) || inp.closest('div').querySelector('label');
            if (label) {
                data.push({
                    id: inp.id,
                    type: "text",
                    question: getVisibleText(label),
                    element: inp
                });
            }
        }
    });

    // 2. Radio & Checkbox via name groups (handles LinkedIn's fb-radio-group or fieldsets)
    const radioCheckboxGroups = {};
    document.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(inp => {
        if (inp.hidden || inp.disabled) return;
        const name = inp.name;
        if (!name) return;
        if (!radioCheckboxGroups[name]) radioCheckboxGroups[name] = [];
        radioCheckboxGroups[name].push(inp);
    });

    for (const [name, inputs] of Object.entries(radioCheckboxGroups)) {
        // Find the question for this group. It's usually the text of the closest fieldset/legend or a previous sibling span
        const firstInput = inputs[0];
        const fieldset = firstInput.closest('fieldset');
        const container = firstInput.closest('.fb-radio-group') || firstInput.closest('.fb-checkbox-group') || fieldset;
        
        // Safe question text grab. Look for legend, or the primary label span inside the container
        let qText = "";
        if (fieldset && fieldset.querySelector('legend')) {
            qText = getVisibleText(fieldset.querySelector('legend'));
        } else if (container) {
            // Usually the question is a span at the top of the container with a specific class like .fb-form-element-label
            const titleSpan = container.querySelector('.fb-form-element-label, .fb-radio-group__title, .fb-checkbox-group__title');
            if (titleSpan) {
                qText = getVisibleText(titleSpan);
            } else {
                // Heuristic: just grab the first visible text node child that isn't the options themselves
                qText = Array.from(container.childNodes)
                     .filter(node => (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim()) || (node.nodeType === Node.ELEMENT_NODE && getVisibleText(node).trim() && !node.querySelector('input')))
                     .map(node => node.nodeType === Node.TEXT_NODE ? node.nodeValue : getVisibleText(node))[0];
            }
        }
        
        qText = (qText || name).trim();

        // Parse options strictly via labels connected to the inputs
        const options = [];
        inputs.forEach(inp => {
            const label = document.querySelector(`label[for="${inp.id}"]`);
            if (label) {
                const optText = getVisibleText(label).trim();
                options.push(optText);
                inp._foundLabel = label; // Tag the input for easy clicking later
            }
        });

        if (options.length > 0) {
            data.push({
                id: name,
                type: firstInput.type, // 'radio' or 'checkbox'
                question: qText,
                options: options,
                inputs: inputs // Raw elements passed straight to filler
            });
        }
    }

    // 3. Dropdowns
    const selects = document.querySelectorAll('select');
    selects.forEach(sel => {
        if (!sel.value || sel.value.includes("Select") || sel.options[sel.selectedIndex].text.includes("Select")) {
            const label = document.querySelector(`label[for="${sel.id}"]`);
            if (label) {
                const options = Array.from(sel.querySelectorAll('option'))
                    .map(o => getVisibleText(o).trim())
                    .filter(t => t && !t.includes("Select"));
                
                if (options.length > 0) {
                    data.push({
                        id: sel.id,
                        type: "dropdown",
                        question: getVisibleText(label),
                        options,
                        element: sel
                    });
                }
            }
        }
    });
    
    return data;
}

function fillFormAnswers(questionData, aiAnswers) {
    for (const q of questionData) {
        const answer = aiAnswers[q.id] || aiAnswers[q.question];
        if (!answer) continue;

        try {
            if (q.type === "text") {
                console.log(`Filling text: ${answer}`);
                setReactValue(q.element, answer);
            } 
            else if (q.type === "radio") {
                console.log(`Selecting radio: ${answer}`);
                const targetInput = q.inputs.find(inp => inp._foundLabel && getVisibleText(inp._foundLabel).trim().toLowerCase() === String(answer).trim().toLowerCase());
                
                if (targetInput) {
                    targetInput._foundLabel.click();
                    targetInput.click();
                }
            } 
            else if (q.type === "checkbox") {
                console.log(`Selecting checkbox: ${answer}`);
                const answerList = Array.isArray(answer) ? answer : [String(answer)];
                
                for (const ans of answerList) {
                    const targetInput = q.inputs.find(inp => inp._foundLabel && getVisibleText(inp._foundLabel).trim().toLowerCase() === String(ans).trim().toLowerCase());
                    if (targetInput && !targetInput.checked) {
                        targetInput._foundLabel.click();
                        targetInput.click();
                    }
                }
            }
            else if (q.type === "dropdown") {
                console.log(`Selecting dropdown: ${answer}`);
                const options = Array.from(q.element.querySelectorAll('option'));
                const targetOpt = options.find(o => getVisibleText(o).trim().toLowerCase().includes(String(answer).trim().toLowerCase()));
                if (targetOpt) {
                    q.element.value = targetOpt.value;
                    q.element.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
        } catch (e) {
            console.error(`Failed to fill field ${q.id}:`, e);
        }
    }
}

async function fetchAnswersFromAPI(userId, questionsPayload) {
    // Strip HTML elements from payload before sending
    const cleanQuestions = questionsPayload.map(q => ({
        id: q.id,
        type: q.type,
        question: q.question,
        options: q.options
    }));

    return new Promise((resolve) => {
        chrome.runtime.sendMessage({ 
            action: "FETCH_ANSWERS", 
            payload: { userId, questions: cleanQuestions } 
        }, (response) => {
             if (response && response.data) {
                 resolve(response.data);
             } else {
                 console.error("API Error:", response?.error);
                 resolve(null);
             }
        });
    });
}

function discardApplication() {
    isApplying = false;
    const dismissBtns = Array.from(document.querySelectorAll('button')).find(b => getVisibleText(b).toLowerCase().includes('dismiss'));
    if (dismissBtns) {
        dismissBtns.click();
        setTimeout(() => {
            const discardBtns = Array.from(document.querySelectorAll('button')).find(b => getVisibleText(b).toLowerCase().includes('discard'));
            if (discardBtns) discardBtns.click();
        }, 1000);
    }
}
