/**
 * Everything that renders on /blog.
 *
 * Post content lives one file per post in src/content/blog/, named after its
 * slug. This module is the only place that knows the full set, so adding a post
 * means creating its file and adding one import line here.
 *
 * Held in plain, dependency-free modules (no CMS, no markdown parser) so the
 * pages can be statically prerendered at build time. That matters here: static
 * pages were the only ones that stayed up — and stayed indexed — during the
 * serverless outage, and a blog only earns its keep if crawlers can always
 * reach it.
 *
 * Each post targets a keyword cluster around AI and hiring, and links back to
 * the ATS checker, the resume builder and the job search so the traffic has
 * somewhere to convert.
 *
 * A post's `slug` is its public URL. Renaming a file is free; changing a slug
 * breaks a live URL and needs a redirect, so treat slugs as permanent.
 */

import type { BlogPost } from './types';

import howToUseAiForJobSearch from '@/content/blog/how-to-use-ai-for-job-search';
import willAiTakeMyJob from '@/content/blog/will-ai-take-my-job';
import howApplicantTrackingSystemsWork from '@/content/blog/how-applicant-tracking-systems-work';
import aiResumeWritingGuide from '@/content/blog/ai-resume-writing-guide';
import highestPayingAiJobs from '@/content/blog/highest-paying-ai-jobs';
import aiInterviewPreparation from '@/content/blog/ai-interview-preparation';
import aiSkillsInDemand from '@/content/blog/ai-skills-in-demand';
import whatIsAgi from '@/content/blog/what-is-agi';
import promptEngineeringJobs from '@/content/blog/prompt-engineering-jobs';
import aiJobsForFreshers from '@/content/blog/ai-jobs-for-freshers';
import howToLearnAiFromScratch from '@/content/blog/how-to-learn-ai-from-scratch';
import aiEngineerVsDataScientist from '@/content/blog/ai-engineer-vs-data-scientist';
import whatAreAiAgents from '@/content/blog/what-are-ai-agents';
import aiJobsWithoutCoding from '@/content/blog/ai-jobs-without-coding';
import areAiCertificationsWorthIt from '@/content/blog/are-ai-certifications-worth-it';
import howCompaniesUseAiInHiring from '@/content/blog/how-companies-use-ai-in-hiring';

// Batch 1 — AI engineering, security and governance
import whatIsContextEngineering from '@/content/blog/what-is-context-engineering';
import mcpExplainedForDevelopers from '@/content/blog/mcp-explained-for-developers';
import vibeCoding from '@/content/blog/vibe-coding';
import llmopsVsMlops from '@/content/blog/llmops-vs-mlops';
import aiSecurityJobs from '@/content/blog/ai-security-jobs';
import howToBecomeAnAiSecurityEngineer from '@/content/blog/how-to-become-an-ai-security-engineer';
import aiEvaluationLlmEvals from '@/content/blog/ai-evaluation-llm-evals';
import aiGovernanceJobs from '@/content/blog/ai-governance-jobs';
import physicalAiRoboticsJobs from '@/content/blog/physical-ai-robotics-jobs';
import aiInferenceEngineer from '@/content/blog/ai-inference-engineer';

// Batch 2 — career roadmaps and developer tech
import aiProductManagerRoadmap from '@/content/blog/ai-product-manager-roadmap';
import dataEngineerRoadmap from '@/content/blog/data-engineer-roadmap';
import cloudEngineerRoadmap from '@/content/blog/cloud-engineer-roadmap';
import cybersecurityRoadmap from '@/content/blog/cybersecurity-roadmap';
import devopsEngineerRoadmap from '@/content/blog/devops-engineer-roadmap';
import pythonDeveloperRoadmap from '@/content/blog/python-developer-roadmap';
import fullStackDeveloperRoadmap from '@/content/blog/full-stack-developer-roadmap';
import react19ForDevelopers from '@/content/blog/react-19-for-developers';
import nextjs16ForDevelopers from '@/content/blog/nextjs-16-for-developers';
import dotnet10Csharp14 from '@/content/blog/dotnet-10-csharp-14';

// Batch 3 — global careers, job search safety and interview guides
import gccJobsInIndia from '@/content/blog/gcc-jobs-in-india';
import internationalJobsFromIndia from '@/content/blog/international-jobs-from-india';
import remoteTechJobs from '@/content/blog/remote-tech-jobs';
import visaSponsorshipTechJobs from '@/content/blog/visa-sponsorship-tech-jobs';
import fakeJobOfferScams from '@/content/blog/fake-job-offer-scams';
import fakeRecruiterScams from '@/content/blog/fake-recruiter-scams';
import aiEngineerInterviewQuestions from '@/content/blog/ai-engineer-interview-questions';
import aiAgentInterviewQuestions from '@/content/blog/ai-agent-interview-questions';
import dataEngineerInterviewQuestions from '@/content/blog/data-engineer-interview-questions';
import cybersecurityInterviewQuestions from '@/content/blog/cybersecurity-interview-questions';

// Batch 4 — AI foundations and remaining roadmaps
import whatIsPromptInjection from '@/content/blog/what-is-prompt-injection';
import whatIsAgenticAi from '@/content/blog/what-is-agentic-ai';
import ragExplained from '@/content/blog/rag-explained';
import aiAgentsVsAssistantsVsChatbots from '@/content/blog/ai-agents-vs-assistants-vs-chatbots';
import whatIsAiObservability from '@/content/blog/what-is-ai-observability';
import frontendDeveloperRoadmap from '@/content/blog/frontend-developer-roadmap';
import backendDeveloperRoadmap from '@/content/blog/backend-developer-roadmap';
import howToGetAnAiJobWithoutAMasters from '@/content/blog/how-to-get-an-ai-job-without-a-masters';
import howToGetAGccJobWithoutExperience from '@/content/blog/how-to-get-a-gcc-job-without-experience';
import remoteJobsVsHybridJobs from '@/content/blog/remote-jobs-vs-hybrid-jobs';
import remoteJobScams from '@/content/blog/remote-job-scams';
import howToVerifyAJobPostingIsGenuine from '@/content/blog/how-to-verify-a-job-posting-is-genuine';
import promptEngineeringInterviewQuestions from '@/content/blog/prompt-engineering-interview-questions';
import llmopsInterviewQuestions from '@/content/blog/llmops-interview-questions';
import pythonInterviewQuestionsForFreshers from '@/content/blog/python-interview-questions-for-freshers';
import reactInterviewQuestions from '@/content/blog/react-interview-questions';
import dotnetDeveloperInterviewQuestions from '@/content/blog/dotnet-developer-interview-questions';
import devopsInterviewQuestions from '@/content/blog/devops-interview-questions';

// Batch 5 — AI agent concepts
import whatIsAnAiJobAgent from '@/content/blog/what-is-an-ai-job-agent';
import aiJobApplicationAgentExplained from '@/content/blog/ai-job-application-agent-explained';
import whatIsAgenticJobSearch from '@/content/blog/what-is-agentic-job-search';
import whatIsAiPoweredJobHunting from '@/content/blog/what-is-ai-powered-job-hunting';
import whatIsAutonomousJobApplication from '@/content/blog/what-is-autonomous-job-application';
import whatIsBrowserAi from '@/content/blog/what-is-browser-ai';
import whatIsComputerUsingAi from '@/content/blog/what-is-computer-using-ai';
import whatIsAgenticAutomation from '@/content/blog/what-is-agentic-automation';
import whatIsAiWorkforceAutomation from '@/content/blog/what-is-ai-workforce-automation';
import whatIsAiToAiHiring from '@/content/blog/what-is-ai-to-ai-hiring';

// Batch 6 — building job agents
import howToBuildAnAiJobApplicationAgent from '@/content/blog/how-to-build-an-ai-job-application-agent';
import howToBuildAnAiAutoApplyTool from '@/content/blog/how-to-build-an-ai-auto-apply-tool';
import howToBuildAnAiJobSearchAutomationTool from '@/content/blog/how-to-build-an-ai-job-search-automation-tool';
import howToBuildAnAiAgentThatFillsJobForms from '@/content/blog/how-to-build-an-ai-agent-that-fills-job-forms';
import howToBuildAnAiJobFinderUsingJobApis from '@/content/blog/how-to-build-an-ai-job-finder-using-job-apis';
import howToDetectDuplicateJobListings from '@/content/blog/how-to-detect-duplicate-job-listings';
import howToBuildAnAiAgentThatTracksApplications from '@/content/blog/how-to-build-an-ai-agent-that-tracks-applications';
import howToBuildAnAiAgentThatScoresJobDescriptions from '@/content/blog/how-to-build-an-ai-agent-that-scores-job-descriptions';
import howToBuildAnAiAgentWithHumanApproval from '@/content/blog/how-to-build-an-ai-agent-with-human-approval';
import howToPreventAnAgentApplyingToTheWrongJob from '@/content/blog/how-to-prevent-an-agent-applying-to-the-wrong-job';
import aiJobAgentsAndPromptInjection from '@/content/blog/ai-job-agents-and-prompt-injection';
import aiAgentSecurityPermissionsSandboxing from '@/content/blog/ai-agent-security-permissions-sandboxing';
import howToSafelyGiveAiAgentsBrowserAccess from '@/content/blog/how-to-safely-give-ai-agents-browser-access';
import howToProtectUserCredentialsInAiJobAutomation from '@/content/blog/how-to-protect-user-credentials-in-ai-job-automation';
import aiAgentPrivacyResumeData from '@/content/blog/ai-agent-privacy-resume-data';
import howToBuildReliableAiAgents from '@/content/blog/how-to-build-reliable-ai-agents';
import howToBuildASecureAiJobApplicationPlatform from '@/content/blog/how-to-build-a-secure-ai-job-application-platform';
import howToSecureAnAiBrowserAgent from '@/content/blog/how-to-secure-an-ai-browser-agent';
import howToHandleAuthenticationInAiBrowserAgents from '@/content/blog/how-to-handle-authentication-in-ai-browser-agents';
import howToDesignHumanApprovalForAiJobApplications from '@/content/blog/how-to-design-human-approval-for-ai-job-applications';
import browserAutomationVsAiBrowserAgents from '@/content/blog/browser-automation-vs-ai-browser-agents';
import howAiAgentsUnderstandWebPages from '@/content/blog/how-ai-agents-understand-web-pages';
import howToBuildReliableBrowserAutomation from '@/content/blog/how-to-build-reliable-browser-automation';
import howToTestAnAiBrowserAgent from '@/content/blog/how-to-test-an-ai-browser-agent';
import howToBuildAUniversalAtsAutomationAgent from '@/content/blog/how-to-build-a-universal-ats-automation-agent';
import howToBuildAnAiAgentThatHandlesDifferentForms from '@/content/blog/how-to-build-an-ai-agent-that-handles-different-forms';

// Batch 8 — resume, skills and matching
import howToBuildAnAiResumeParser from '@/content/blog/how-to-build-an-ai-resume-parser';
import howToExtractSkillsFromAResume from '@/content/blog/how-to-extract-skills-from-a-resume';
import howToExtractSkillsFromAJobDescription from '@/content/blog/how-to-extract-skills-from-a-job-description';
import howToCalculateResumeToJobMatchScore from '@/content/blog/how-to-calculate-resume-to-job-match-score';
import howToReduceHallucinationsInAiResumeGeneration from '@/content/blog/how-to-reduce-hallucinations-in-ai-resume-generation';
import howToBuildAnAiResumeTailoringSystem from '@/content/blog/how-to-build-an-ai-resume-tailoring-system';
import aiResumeTailoringVsOneResume from '@/content/blog/ai-resume-tailoring-vs-one-resume';
import howToBuildAnAiCoverLetterGenerator from '@/content/blog/how-to-build-an-ai-cover-letter-generator';
import howToBuildAJobMatchingSystemUsingEmbeddings from '@/content/blog/how-to-build-a-job-matching-system-using-embeddings';
import howToMatchAResumeWithAJobDescription from '@/content/blog/how-to-match-a-resume-with-a-job-description';
import howToUseVectorDatabasesForAiJobMatching from '@/content/blog/how-to-use-vector-databases-for-ai-job-matching';
import keywordMatchingVsSemanticMatching from '@/content/blog/keyword-matching-vs-semantic-matching';
import postgresqlPgvectorForAiJobSearch from '@/content/blog/postgresql-pgvector-for-ai-job-search';
import howEmbeddingsImproveJobRecommendations from '@/content/blog/how-embeddings-improve-job-recommendations';
import howToBuildAJobMatchingAiWithPostgresql from '@/content/blog/how-to-build-a-job-matching-ai-with-postgresql';
import howToBuildAJobRecommendationEngineWithPgvector from '@/content/blog/how-to-build-a-job-recommendation-engine-with-pgvector';
import howToBuildAJobSearchRagSystem from '@/content/blog/how-to-build-a-job-search-rag-system';
import howToBuildARecommendationEngineForJobs from '@/content/blog/how-to-build-a-recommendation-engine-for-jobs';
import howToBuildAnAiJobRecommendationEngine from '@/content/blog/how-to-build-an-ai-job-recommendation-engine';
import howToBuildAnAiJobRelevanceScore from '@/content/blog/how-to-build-an-ai-job-relevance-score';
import howToBuildSemanticJobSearch from '@/content/blog/how-to-build-semantic-job-search';
import howToEvaluateAnAiJobMatchingModel from '@/content/blog/how-to-evaluate-an-ai-job-matching-model';
import howToUseLlmsToRankJobListings from '@/content/blog/how-to-use-llms-to-rank-job-listings';
import ragForJobSearchAiCareerAssistant from '@/content/blog/rag-for-job-search-ai-career-assistant';
import howToBuildAJobAgentWithMcp from '@/content/blog/how-to-build-a-job-agent-with-mcp';
import howToBuildALongRunningAiAgent from '@/content/blog/how-to-build-a-long-running-ai-agent';
import howToBuildAMultiAgentJobSearchSystem from '@/content/blog/how-to-build-a-multi-agent-job-search-system';
import howToBuildAnAiAgentThatDecidesWhichJobsToApplyTo from '@/content/blog/how-to-build-an-ai-agent-that-decides-which-jobs-to-apply-to';
import howToBuildAnAiAgentThatLearnsYourJobPreferences from '@/content/blog/how-to-build-an-ai-agent-that-learns-your-job-preferences';
import howToBuildAnAiAgentThatUsesToolsToSearchJobs from '@/content/blog/how-to-build-an-ai-agent-that-uses-tools-to-search-jobs';
import howToBuildAnAiJobSearchAgentWithLanggraph from '@/content/blog/how-to-build-an-ai-job-search-agent-with-langgraph';
import howToGiveAnAiAgentMemory from '@/content/blog/how-to-give-an-ai-agent-memory';
import singleAgentVsMultiAgentJobSearch from '@/content/blog/single-agent-vs-multi-agent-job-search';
import howAiAgentsAutomateGreenhouseApplications from '@/content/blog/how-ai-agents-automate-greenhouse-applications';
import howAiAgentsAutomateLeverApplications from '@/content/blog/how-ai-agents-automate-lever-applications';
import howAiAgentsAutomateWorkdayApplications from '@/content/blog/how-ai-agents-automate-workday-applications';
import howToBuildAComputerUsingAiAgent from '@/content/blog/how-to-build-a-computer-using-ai-agent';
import howToBuildAnAiAgentThatNavigatesAnAts from '@/content/blog/how-to-build-an-ai-agent-that-navigates-an-ats';
import howToBuildAnAiBrowserAgentForJobApplications from '@/content/blog/how-to-build-an-ai-browser-agent-for-job-applications';
import howToBuildAnAiBrowserAgentWithMcp from '@/content/blog/how-to-build-an-ai-browser-agent-with-mcp';
import howToBuildAnAiBrowserAgentWithPlaywright from '@/content/blog/how-to-build-an-ai-browser-agent-with-playwright';
import playwrightVsSeleniumVsPuppeteerForAiAgents from '@/content/blog/playwright-vs-selenium-vs-puppeteer-for-ai-agents';
import howAiCanCreateJobSpecificResumeVersions from '@/content/blog/how-ai-can-create-job-specific-resume-versions';
import howAiCanDetectMissingSkillsBeforeYouApply from '@/content/blog/how-ai-can-detect-missing-skills-before-you-apply';
import howToAutomaticallyRewriteAResumeForEveryJob from '@/content/blog/how-to-automatically-rewrite-a-resume-for-every-job';
import howToBuildAPersonalizedJobSearchProfile from '@/content/blog/how-to-build-a-personalized-job-search-profile';
import howToBuildAnAiAtsResumeScorer from '@/content/blog/how-to-build-an-ai-ats-resume-scorer';
import howToBuildAnAiCareerGapAnalyzer from '@/content/blog/how-to-build-an-ai-career-gap-analyzer';
import howToBuildAnAiJobApplicationPersonalizationEngine from '@/content/blog/how-to-build-an-ai-job-application-personalization-engine';
import howToBuildAnAiResumeGapAnalyzer from '@/content/blog/how-to-build-an-ai-resume-gap-analyzer';
import howToBuildAnAiResumeKeywordOptimizer from '@/content/blog/how-to-build-an-ai-resume-keyword-optimizer';
import howAiCanPersonalizeRecruiterMessagesAtScale from '@/content/blog/how-ai-can-personalize-recruiter-messages-at-scale';
import howToAutomateJobApplicationFollowUps from '@/content/blog/how-to-automate-job-application-follow-ups';
import howToAutomatePersonalizedRecruiterEmails from '@/content/blog/how-to-automate-personalized-recruiter-emails';
import howToBuildAJobSearchCrmWithAi from '@/content/blog/how-to-build-a-job-search-crm-with-ai';
import howToBuildAnAiAgentThatFindsRecruiterEmails from '@/content/blog/how-to-build-an-ai-agent-that-finds-recruiter-emails';
import howToBuildAnAiAgentThatTracksRecruiterResponses from '@/content/blog/how-to-build-an-ai-agent-that-tracks-recruiter-responses';
import howToBuildAnAiColdEmailAgent from '@/content/blog/how-to-build-an-ai-cold-email-agent';
import howToBuildAnAiFollowUpAgent from '@/content/blog/how-to-build-an-ai-follow-up-agent';
import howToBuildAnAiLinkedinOutreachAssistant from '@/content/blog/how-to-build-an-ai-linkedin-outreach-assistant';
import howToBuildAnAiRecruiterOutreachAgent from '@/content/blog/how-to-build-an-ai-recruiter-outreach-agent';
import howToBuildAnAiJobAgentWithClaude from '@/content/blog/how-to-build-an-ai-job-agent-with-claude';
import howToBuildAnAiJobAgentWithDotnet from '@/content/blog/how-to-build-an-ai-job-agent-with-dotnet';
import howToBuildAnAiJobAgentWithGemini from '@/content/blog/how-to-build-an-ai-job-agent-with-gemini';
import howToBuildAnAiJobAgentWithNextjs from '@/content/blog/how-to-build-an-ai-job-agent-with-nextjs';
import howToBuildAnAiJobAgentWithNodejs from '@/content/blog/how-to-build-an-ai-job-agent-with-nodejs';
import howToBuildAnAiJobAgentWithOpenai from '@/content/blog/how-to-build-an-ai-job-agent-with-openai';
import howToBuildAnAiJobAgentWithPython from '@/content/blog/how-to-build-an-ai-job-agent-with-python';
import howAiAgentsSearchAndApplyForJobs from '@/content/blog/how-ai-agents-search-and-apply-for-jobs';
import howToBuildAJobApplicationAgentWithBrowserAutomation from '@/content/blog/how-to-build-a-job-application-agent-with-browser-automation';
import howToBuildAnAiAgentThatFindsJobsFromMultipleWebsites from '@/content/blog/how-to-build-an-ai-agent-that-finds-jobs-from-multiple-websites';
import howToBuildAnAiAgentThatFindsJobsMatchingYourResume from '@/content/blog/how-to-build-an-ai-agent-that-finds-jobs-matching-your-resume';
import howToBuildAnAiJobAggregatorWithLlms from '@/content/blog/how-to-build-an-ai-job-aggregator-with-llms';
import howToBuildAnAiResumeTailoringAgent from '@/content/blog/how-to-build-an-ai-resume-tailoring-agent';
import mlopsVsLlmopsVsAiEngineering from '@/content/blog/mlops-vs-llmops-vs-ai-engineering';
import howToBuildAMultiAgentRecruitmentPlatform from '@/content/blog/how-to-build-a-multi-agent-recruitment-platform';
import howToBuildAnAiApplicationTrackingSystem from '@/content/blog/how-to-build-an-ai-application-tracking-system';
import howToBuildAnAiAtsScoringSystem from '@/content/blog/how-to-build-an-ai-ats-scoring-system';
import howToBuildAnAiCareerAssistantForJobSeekers from '@/content/blog/how-to-build-an-ai-career-assistant-for-job-seekers';
import howToBuildAnAiJobApplicationAnalyticsDashboard from '@/content/blog/how-to-build-an-ai-job-application-analytics-dashboard';
import howToBuildAnAiJobDescriptionParser from '@/content/blog/how-to-build-an-ai-job-description-parser';
import howToBuildAnAiJobSearchDashboard from '@/content/blog/how-to-build-an-ai-job-search-dashboard';
import aiJobApplicationAutomationBenefitsRisks from '@/content/blog/ai-job-application-automation-benefits-risks';
import aiJobSearchCopilotVsApplicationAgent from '@/content/blog/ai-job-search-copilot-vs-application-agent';
import howToBuildAnAiAgentThatDetectsJobsWorthApplyingTo from '@/content/blog/how-to-build-an-ai-agent-that-detects-jobs-worth-applying-to';
import howToBuildAnAiAgentThatImprovesOverTime from '@/content/blog/how-to-build-an-ai-agent-that-improves-over-time';
import howToBuildAnAiAgentThatLearnsFromRejections from '@/content/blog/how-to-build-an-ai-agent-that-learns-from-rejections';
import howToBuildAnAiJobSearchCopilot from '@/content/blog/how-to-build-an-ai-job-search-copilot';
import howToBuildAnAiSystemThatPrioritizesApplications from '@/content/blog/how-to-build-an-ai-system-that-prioritizes-applications';
import aiAutoApplyVsManualApplications from '@/content/blog/ai-auto-apply-vs-manual-applications';
import canAiApplyTo100JobsADay from '@/content/blog/can-ai-apply-to-100-jobs-a-day';
import canAiPersonalize100JobApplications from '@/content/blog/can-ai-personalize-100-job-applications';
import howAiCanAutomateYourEntireJobSearchWorkflow from '@/content/blog/how-ai-can-automate-your-entire-job-search-workflow';
import howAiCanReduceTimeSpentApplying from '@/content/blog/how-ai-can-reduce-time-spent-applying';
import howManyJobsShouldYouApplyToWithAi from '@/content/blog/how-many-jobs-should-you-apply-to-with-ai';
import howToAutomateYourJobSearchWithAi from '@/content/blog/how-to-automate-your-job-search-with-ai';
import aiAgentsVsRecruiters from '@/content/blog/ai-agents-vs-recruiters';
import aiAgentsVsTraditionalJobSearch from '@/content/blog/ai-agents-vs-traditional-job-search';
import buildingAnEndToEndAutonomousJobSearchSystem from '@/content/blog/building-an-end-to-end-autonomous-job-search-system';
import fromResumeToInterviewAiJobAgent from '@/content/blog/from-resume-to-interview-ai-job-agent';
import howAiAgentsAreChangingJobApplications from '@/content/blog/how-ai-agents-are-changing-job-applications';
import theCompleteArchitectureOfAnAiJobApplicationPlatform from '@/content/blog/the-complete-architecture-of-an-ai-job-application-platform';
import theFutureOfJobApplicationsHumansVsAiAgents from '@/content/blog/the-future-of-job-applications-humans-vs-ai-agents';
import willAiAgentsApplyForJobsForYou from '@/content/blog/will-ai-agents-apply-for-jobs-for-you';
import willRecruitersUseAiToInterviewAiAgents from '@/content/blog/will-recruiters-use-ai-to-interview-ai-agents';
import techLayoffs2026AiJobs from '@/content/blog/tech-layoffs-2026-ai-jobs';
import ragAlternativesIn2026 from '@/content/blog/rag-alternatives-in-2026';
import ragVsLongContextCag from '@/content/blog/rag-vs-long-context-cag';
import whatIsAgenticRag from '@/content/blog/what-is-agentic-rag';
import whatIsGraphrag from '@/content/blog/what-is-graphrag';
import mcpVsRag from '@/content/blog/mcp-vs-rag';
import ragVsFineTuning from '@/content/blog/rag-vs-fine-tuning';
import textToSqlVsRag from '@/content/blog/text-to-sql-vs-rag';
import aiMemoryVsRag from '@/content/blog/ai-memory-vs-rag';
import hybridSearchVsVectorSearch from '@/content/blog/hybrid-search-vs-vector-search';
import howToReduceRagHallucinations from '@/content/blog/how-to-reduce-rag-hallucinations';
import ragForRecruitmentAndHiring from '@/content/blog/rag-for-recruitment-and-hiring';
import howToBuildARagApplicationFromScratch from '@/content/blog/how-to-build-a-rag-application-from-scratch';
import howToBuildARagChatbot from '@/content/blog/how-to-build-a-rag-chatbot';
import advancedRagRetrievalTechniques from '@/content/blog/advanced-rag-retrieval-techniques';
import whatIsMultimodalRag from '@/content/blog/what-is-multimodal-rag';
import aiSearchEnginesVsRag from '@/content/blog/ai-search-engines-vs-rag';
import howToBuildARagResumeAssistant from '@/content/blog/how-to-build-a-rag-resume-assistant';
import ragForCompanyKnowledgeBases from '@/content/blog/rag-for-company-knowledge-bases';
import contextRotExplained from '@/content/blog/context-rot-explained';
import selfRagVsCorrectiveRagVsAdaptiveRag from '@/content/blog/self-rag-vs-corrective-rag-vs-adaptive-rag';
import howToBuildAnAgenticRagSystem from '@/content/blog/how-to-build-an-agentic-rag-system';
import howToBuildAGraphragApplication from '@/content/blog/how-to-build-a-graphrag-application';
import howToBuildAnAiDatabaseAssistant from '@/content/blog/how-to-build-an-ai-database-assistant';
import vectorDatabaseVsSearchEngineForAi from '@/content/blog/vector-database-vs-search-engine-for-ai';
import howToReduceRagLatencyAndCost from '@/content/blog/how-to-reduce-rag-latency-and-cost';
import commonRagMistakes from '@/content/blog/common-rag-mistakes';
import ragForPdfs from '@/content/blog/rag-for-pdfs';
import ragForResumeScreening from '@/content/blog/rag-for-resume-screening';
import ragForJobRecommendations from '@/content/blog/rag-for-job-recommendations';
import ragForInterviewPreparation from '@/content/blog/rag-for-interview-preparation';
import howToEvaluateARagSystem from '@/content/blog/how-to-evaluate-a-rag-system';
import ragRerankingExplained from '@/content/blog/rag-reranking-explained';
import howVectorEmbeddingsWork from '@/content/blog/how-vector-embeddings-work';
import whatIsModularRag from '@/content/blog/what-is-modular-rag';
import canPostgresqlReplaceAVectorDatabase from '@/content/blog/can-postgresql-replace-a-vector-database';
import webSearchVsRag from '@/content/blog/web-search-vs-rag';
import howToBuildAnMcpServer from '@/content/blog/how-to-build-an-mcp-server';

/**
 * Declaration order is not display order — getAllPosts sorts by date — so a new
 * post can simply be appended.
 */
export const BLOG_POSTS: BlogPost[] = [
  howToUseAiForJobSearch,
  willAiTakeMyJob,
  howApplicantTrackingSystemsWork,
  aiResumeWritingGuide,
  highestPayingAiJobs,
  aiInterviewPreparation,
  aiSkillsInDemand,
  whatIsAgi,
  promptEngineeringJobs,
  aiJobsForFreshers,
  howToLearnAiFromScratch,
  aiEngineerVsDataScientist,
  whatAreAiAgents,
  aiJobsWithoutCoding,
  areAiCertificationsWorthIt,
  howCompaniesUseAiInHiring,

  whatIsContextEngineering,
  mcpExplainedForDevelopers,
  vibeCoding,
  llmopsVsMlops,
  aiSecurityJobs,
  howToBecomeAnAiSecurityEngineer,
  aiEvaluationLlmEvals,
  aiGovernanceJobs,
  physicalAiRoboticsJobs,
  aiInferenceEngineer,

  aiProductManagerRoadmap,
  dataEngineerRoadmap,
  cloudEngineerRoadmap,
  cybersecurityRoadmap,
  devopsEngineerRoadmap,
  pythonDeveloperRoadmap,
  fullStackDeveloperRoadmap,
  react19ForDevelopers,
  nextjs16ForDevelopers,
  dotnet10Csharp14,

  gccJobsInIndia,
  internationalJobsFromIndia,
  remoteTechJobs,
  visaSponsorshipTechJobs,
  fakeJobOfferScams,
  fakeRecruiterScams,
  aiEngineerInterviewQuestions,
  aiAgentInterviewQuestions,
  dataEngineerInterviewQuestions,
  cybersecurityInterviewQuestions,

  whatIsPromptInjection,
  whatIsAgenticAi,
  ragExplained,
  aiAgentsVsAssistantsVsChatbots,
  whatIsAiObservability,
  frontendDeveloperRoadmap,
  backendDeveloperRoadmap,
  howToGetAnAiJobWithoutAMasters,
  howToGetAGccJobWithoutExperience,
  remoteJobsVsHybridJobs,
  remoteJobScams,
  howToVerifyAJobPostingIsGenuine,
  promptEngineeringInterviewQuestions,
  llmopsInterviewQuestions,
  pythonInterviewQuestionsForFreshers,
  reactInterviewQuestions,
  dotnetDeveloperInterviewQuestions,
  devopsInterviewQuestions,

  whatIsAnAiJobAgent,
  aiJobApplicationAgentExplained,
  whatIsAgenticJobSearch,
  whatIsAiPoweredJobHunting,
  whatIsAutonomousJobApplication,
  whatIsBrowserAi,
  whatIsComputerUsingAi,
  whatIsAgenticAutomation,
  whatIsAiWorkforceAutomation,
  whatIsAiToAiHiring,

  howToBuildAnAiJobApplicationAgent,
  howToBuildAnAiAutoApplyTool,
  howToBuildAnAiJobSearchAutomationTool,
  howToBuildAnAiAgentThatFillsJobForms,
  howToBuildAnAiJobFinderUsingJobApis,
  howToDetectDuplicateJobListings,
  howToBuildAnAiAgentThatTracksApplications,
  howToBuildAnAiAgentThatScoresJobDescriptions,
  howToBuildAnAiAgentWithHumanApproval,
  howToPreventAnAgentApplyingToTheWrongJob,
  aiJobAgentsAndPromptInjection,
  aiAgentSecurityPermissionsSandboxing,
  howToSafelyGiveAiAgentsBrowserAccess,
  howToProtectUserCredentialsInAiJobAutomation,
  aiAgentPrivacyResumeData,
  howToBuildReliableAiAgents,
  howToBuildASecureAiJobApplicationPlatform,
  howToSecureAnAiBrowserAgent,
  howToHandleAuthenticationInAiBrowserAgents,
  howToDesignHumanApprovalForAiJobApplications,
  browserAutomationVsAiBrowserAgents,
  howAiAgentsUnderstandWebPages,
  howToBuildReliableBrowserAutomation,
  howToTestAnAiBrowserAgent,
  howToBuildAUniversalAtsAutomationAgent,
  howToBuildAnAiAgentThatHandlesDifferentForms,

  howToBuildAnAiResumeParser,
  howToExtractSkillsFromAResume,
  howToExtractSkillsFromAJobDescription,
  howToCalculateResumeToJobMatchScore,
  howToReduceHallucinationsInAiResumeGeneration,
  howToBuildAnAiResumeTailoringSystem,
  aiResumeTailoringVsOneResume,
  howToBuildAnAiCoverLetterGenerator,
  howToBuildAJobMatchingSystemUsingEmbeddings,
  howToMatchAResumeWithAJobDescription,
  howToUseVectorDatabasesForAiJobMatching,
  keywordMatchingVsSemanticMatching,
  postgresqlPgvectorForAiJobSearch,
  howEmbeddingsImproveJobRecommendations,
  howToBuildAJobMatchingAiWithPostgresql,
  howToBuildAJobRecommendationEngineWithPgvector,
  howToBuildAJobSearchRagSystem,
  howToBuildARecommendationEngineForJobs,
  howToBuildAnAiJobRecommendationEngine,
  howToBuildAnAiJobRelevanceScore,
  howToBuildSemanticJobSearch,
  howToEvaluateAnAiJobMatchingModel,
  howToUseLlmsToRankJobListings,
  ragForJobSearchAiCareerAssistant,
  howToBuildAJobAgentWithMcp,
  howToBuildALongRunningAiAgent,
  howToBuildAMultiAgentJobSearchSystem,
  howToBuildAnAiAgentThatDecidesWhichJobsToApplyTo,
  howToBuildAnAiAgentThatLearnsYourJobPreferences,
  howToBuildAnAiAgentThatUsesToolsToSearchJobs,
  howToBuildAnAiJobSearchAgentWithLanggraph,
  howToGiveAnAiAgentMemory,
  singleAgentVsMultiAgentJobSearch,
  howAiAgentsAutomateGreenhouseApplications,
  howAiAgentsAutomateLeverApplications,
  howAiAgentsAutomateWorkdayApplications,
  howToBuildAComputerUsingAiAgent,
  howToBuildAnAiAgentThatNavigatesAnAts,
  howToBuildAnAiBrowserAgentForJobApplications,
  howToBuildAnAiBrowserAgentWithMcp,
  howToBuildAnAiBrowserAgentWithPlaywright,
  playwrightVsSeleniumVsPuppeteerForAiAgents,
  howAiCanCreateJobSpecificResumeVersions,
  howAiCanDetectMissingSkillsBeforeYouApply,
  howToAutomaticallyRewriteAResumeForEveryJob,
  howToBuildAPersonalizedJobSearchProfile,
  howToBuildAnAiAtsResumeScorer,
  howToBuildAnAiCareerGapAnalyzer,
  howToBuildAnAiJobApplicationPersonalizationEngine,
  howToBuildAnAiResumeGapAnalyzer,
  howToBuildAnAiResumeKeywordOptimizer,
  howAiCanPersonalizeRecruiterMessagesAtScale,
  howToAutomateJobApplicationFollowUps,
  howToAutomatePersonalizedRecruiterEmails,
  howToBuildAJobSearchCrmWithAi,
  howToBuildAnAiAgentThatFindsRecruiterEmails,
  howToBuildAnAiAgentThatTracksRecruiterResponses,
  howToBuildAnAiColdEmailAgent,
  howToBuildAnAiFollowUpAgent,
  howToBuildAnAiLinkedinOutreachAssistant,
  howToBuildAnAiRecruiterOutreachAgent,
  howToBuildAnAiJobAgentWithClaude,
  howToBuildAnAiJobAgentWithDotnet,
  howToBuildAnAiJobAgentWithGemini,
  howToBuildAnAiJobAgentWithNextjs,
  howToBuildAnAiJobAgentWithNodejs,
  howToBuildAnAiJobAgentWithOpenai,
  howToBuildAnAiJobAgentWithPython,
  howAiAgentsSearchAndApplyForJobs,
  howToBuildAJobApplicationAgentWithBrowserAutomation,
  howToBuildAnAiAgentThatFindsJobsFromMultipleWebsites,
  howToBuildAnAiAgentThatFindsJobsMatchingYourResume,
  howToBuildAnAiJobAggregatorWithLlms,
  howToBuildAnAiResumeTailoringAgent,
  mlopsVsLlmopsVsAiEngineering,
  howToBuildAMultiAgentRecruitmentPlatform,
  howToBuildAnAiApplicationTrackingSystem,
  howToBuildAnAiAtsScoringSystem,
  howToBuildAnAiCareerAssistantForJobSeekers,
  howToBuildAnAiJobApplicationAnalyticsDashboard,
  howToBuildAnAiJobDescriptionParser,
  howToBuildAnAiJobSearchDashboard,
  aiJobApplicationAutomationBenefitsRisks,
  aiJobSearchCopilotVsApplicationAgent,
  howToBuildAnAiAgentThatDetectsJobsWorthApplyingTo,
  howToBuildAnAiAgentThatImprovesOverTime,
  howToBuildAnAiAgentThatLearnsFromRejections,
  howToBuildAnAiJobSearchCopilot,
  howToBuildAnAiSystemThatPrioritizesApplications,
  aiAutoApplyVsManualApplications,
  canAiApplyTo100JobsADay,
  canAiPersonalize100JobApplications,
  howAiCanAutomateYourEntireJobSearchWorkflow,
  howAiCanReduceTimeSpentApplying,
  howManyJobsShouldYouApplyToWithAi,
  howToAutomateYourJobSearchWithAi,
  aiAgentsVsRecruiters,
  aiAgentsVsTraditionalJobSearch,
  buildingAnEndToEndAutonomousJobSearchSystem,
  fromResumeToInterviewAiJobAgent,
  howAiAgentsAreChangingJobApplications,
  theCompleteArchitectureOfAnAiJobApplicationPlatform,
  theFutureOfJobApplicationsHumansVsAiAgents,
  willAiAgentsApplyForJobsForYou,
  willRecruitersUseAiToInterviewAiAgents,
  techLayoffs2026AiJobs,
  ragAlternativesIn2026,
  ragVsLongContextCag,
  whatIsAgenticRag,
  whatIsGraphrag,
  mcpVsRag,
  ragVsFineTuning,
  textToSqlVsRag,
  aiMemoryVsRag,
  hybridSearchVsVectorSearch,
  howToReduceRagHallucinations,
  ragForRecruitmentAndHiring,
  howToBuildARagApplicationFromScratch,
  howToBuildARagChatbot,
  advancedRagRetrievalTechniques,
  whatIsMultimodalRag,
  aiSearchEnginesVsRag,
  howToBuildARagResumeAssistant,
  ragForCompanyKnowledgeBases,
  contextRotExplained,
  selfRagVsCorrectiveRagVsAdaptiveRag,
  howToBuildAnAgenticRagSystem,
  howToBuildAGraphragApplication,
  howToBuildAnAiDatabaseAssistant,
  vectorDatabaseVsSearchEngineForAi,
  howToReduceRagLatencyAndCost,
  commonRagMistakes,
  ragForPdfs,
  ragForResumeScreening,
  ragForJobRecommendations,
  ragForInterviewPreparation,
  howToEvaluateARagSystem,
  ragRerankingExplained,
  howVectorEmbeddingsWork,
  whatIsModularRag,
  canPostgresqlReplaceAVectorDatabase,
  webSearchVsRag,
  howToBuildAnMcpServer,
];

export * from './types';
export * from './internal-links';
export * from './external-links';

/** Anchor id for a section heading, used by the in-article table of contents. */
export function sectionId(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getAllPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug);
}

/**
 * The fields a listing card needs, and nothing else.
 *
 * The blog index filters and searches on the client, so this data crosses the
 * server/client boundary and is serialised into the page payload. Passing whole
 * posts would ship every article body — roughly 300KB of prose nobody reading
 * the index has asked for. This keeps that payload proportional to the cards
 * actually rendered.
 */
export interface BlogPostSummary {
  slug: string;
  heading: string;
  excerpt: string;
  category: string;
  readingMinutes: number;
  publishedAt: string;
}

export function getPostSummaries(): BlogPostSummary[] {
  return getAllPosts().map(post => ({
    slug: post.slug,
    heading: post.heading,
    excerpt: post.excerpt,
    category: post.category,
    // Derived rather than copied from the post, so a card never advertises a
    // reading time the article stopped matching when a section was added.
    readingMinutes: estimatedReadingMinutes(post),
    publishedAt: post.publishedAt,
  }));
}

/**
 * Cards per page on the blog index.
 *
 * Page 1 lives at /blog, the rest at /blog/page/2 onwards. Page 1 spends one of
 * its slots on the featured card, so every page shows this many posts either
 * way.
 */
export const POSTS_PER_PAGE = 20;

export function getTotalPages(): number {
  return Math.max(1, Math.ceil(BLOG_POSTS.length / POSTS_PER_PAGE));
}

/** True for a page number that actually exists, used to 404 the rest. */
export function isValidPage(page: number): boolean {
  return Number.isInteger(page) && page >= 1 && page <= getTotalPages();
}

/** Summaries shown on one page, newest first. Pages are 1-indexed. */
export function getPageSummaries(page: number): BlogPostSummary[] {
  const start = (page - 1) * POSTS_PER_PAGE;
  return getPostSummaries().slice(start, start + POSTS_PER_PAGE);
}

/**
 * Full posts for one page, used to build that page's JSON-LD.
 *
 * Each page lists only its own posts: repeating all of them on every page would
 * tell a crawler the same thing three times and describe content that is not on
 * the page it is reading.
 */
export function getPagePosts(page: number): BlogPost[] {
  const start = (page - 1) * POSTS_PER_PAGE;
  return getAllPosts().slice(start, start + POSTS_PER_PAGE);
}

export function getRelatedPosts(post: BlogPost): BlogPost[] {
  return (post.related || [])
    .map(getPostBySlug)
    .filter((p): p is BlogPost => Boolean(p));
}

/**
 * Posts that point at this one — the other half of the link graph.
 *
 * `related` is one-directional: A can name B without B naming A, which leaves
 * some posts with plenty of outbound links and nothing coming back. Surfacing
 * the inbound side makes every article reachable from the articles that discuss
 * it, which is what stops a post two hundred deep in the set becoming an orphan
 * that crawlers reach only through the paginated index.
 *
 * Excludes anything already in the post's own `related` list so the page does
 * not render the same link twice under two headings.
 */
export function getInboundPosts(post: BlogPost, limit = 6): BlogPost[] {
  const alreadyShown = new Set(post.related || []);

  return BLOG_POSTS.filter(
    candidate =>
      candidate.slug !== post.slug &&
      !alreadyShown.has(candidate.slug) &&
      (candidate.related || []).includes(post.slug)
  ).slice(0, limit);
}

/** Word count drives the reading estimate shown on the index and article pages. */
export function wordCount(post: BlogPost): number {
  const body = post.sections
    .flatMap(s => [
      s.heading,
      ...s.paragraphs,
      ...(s.bullets || []),
      ...(s.table ? [s.table.caption, ...s.table.columns, ...s.table.rows.flat()] : []),
      ...(s.example ? [s.example.title, ...s.example.paragraphs] : []),
    ])
    .join(' ');
  const takeaways = (post.keyTakeaways || []).join(' ');
  const faqs = (post.faqs || []).flatMap(f => [f.q, f.a]).join(' ');
  return `${post.excerpt} ${takeaways} ${body} ${faqs}`.split(/\s+/).filter(Boolean).length;
}

/** Average adult reading speed for this kind of prose, in words per minute. */
const WORDS_PER_MINUTE = 230;

/**
 * Reading estimate derived from the text that is actually on the page.
 *
 * Posts also carry a hand-written `readingMinutes`, which was accurate when it
 * was typed and silently stops being accurate the moment a section is added.
 * Computing it means the number cannot drift away from the article, so the
 * declared field is only a floor for very short posts.
 */
export function estimatedReadingMinutes(post: BlogPost): number {
  return Math.max(1, Math.round(wordCount(post) / WORDS_PER_MINUTE));
}
