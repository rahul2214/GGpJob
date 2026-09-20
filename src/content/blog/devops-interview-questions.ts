import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'devops-interview-questions',
  tint: 'emerald',
  title: 'DevOps Interview Questions and What They Really Test',
  heading: 'DevOps interview questions',
  description:
    'The pipeline, infrastructure, observability and incident questions DevOps interviews ask — and why the debugging scenario decides most outcomes.',
  keywords: [
    'devops interview questions',
    'devops engineer interview',
    'ci cd interview questions',
    'kubernetes interview questions',
    'terraform interview questions',
    'sre interview questions',
    'devops incident scenario',
    'devops interview preparation',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'Interviews',
  anchors: ['DevOps interview', 'troubleshooting scenario'],
  excerpt:
    'Tool questions are the warm-up. The interview is decided by a scenario where something is broken and nobody tells you what.',
  keyTakeaways: [
    'Tool familiarity is a filter; the troubleshooting scenario decides the outcome.',
    'Every diagnosis lands in Linux and networking eventually, so that is where preparation pays.',
    'The rollback question is revealing — most teams have one nobody has executed.',
    'On observability, connect metrics to user experience and talk about alert noise.',
    'Find out whether the employer runs Kubernetes before preparing deeply for it.',
  ],
  sections: [
    {
      heading: 'Tools get you in the room; diagnosis gets you the job',
      paragraphs: [
        'You will be asked which tools you have used, and those answers matter only as a filter. The round that decides the outcome is a scenario: a deployment is failing, a service is slow, a pipeline passed but production is broken. Work out why.',
        'What is being assessed is method under ambiguity — whether you gather facts before theorising, and whether you know where to look. Candidates who jump to a suspected cause are the ones whose real incidents last for days.',
        'Narrate the method rather than delivering an answer. The interviewer cannot score reasoning they did not hear, and a candidate who says what they would check and why is demonstrating exactly what the round exists to find.',
      ],
    },
    {
      heading: 'The fundamentals underneath',
      paragraphs: [
        'Expect Linux and networking questions, because every diagnosis eventually lands there. A service cannot reach another service, a container will not start, a disk filled up. Tooling knowledge without this produces engineers who can build a pipeline and cannot fix it.',
        'A common practical question: you have a shell on a machine running a failing service and no runbook — what do you check? Prepare an ordered answer covering process state, logs, ports, DNS resolution, disk and memory.',
        'Have the order ready rather than the list. Checking whether the process is running before reading its logs, and whether the disk is full before suspecting the application, is the difference between a method and a set of commands.',
      ],
      bullets: [
        'Reading logs and journald output under time pressure',
        'Which process holds a port, and whether it is listening where you expect',
        'DNS resolution end to end, including caching confusion',
        'Disk and inode exhaustion, and how they present',
        'Permissions and why a container cannot write where it expects',
      ],
    },
    {
      heading: 'Pipelines and safe deployment',
      paragraphs: [
        'Questions here go beyond "have you used a CI tool". Expect: where do secrets live, how do artefacts move between environments, how do you roll back, and how do you know a rollback actually works.',
        'The rollback question is the revealing one. Many teams have a documented rollback nobody has executed. Saying you test rollback deliberately — and describing a time it did not work — is a strong answer.',
        'Expect a question about the deploy that passed CI and broke production. The answer worth giving is about what CI did not cover: real data volumes, a migration ordering, configuration that only exists in production, or a dependency that behaves differently there.',
      ],
      table: {
        caption: 'What each round is actually assessing',
        columns: ['Round', 'Surface question', 'Assessed on'],
        rows: [
          ['Tools', 'What have you used', 'Filter only'],
          ['Troubleshooting', 'Why is this broken', 'Method before theory'],
          ['Pipelines', 'Describe your CI/CD', 'Rollback, secrets, promotion'],
          ['Infrastructure as code', 'How do you manage state', 'Drift and blast radius'],
          ['Observability', 'What do you monitor', 'Whether alerts get acted on'],
          ['Incident behaviour', 'Tell me about an outage', 'Blameless framing, what changed'],
        ],
      },
    },
    {
      heading: 'Infrastructure as code',
      paragraphs: [
        'Expect state, drift and blast radius. What happens when someone changes a resource by hand, how you detect it, and how you apply a change safely to infrastructure that people are using.',
        'A good preparation story is a change that destroyed and recreated something it should not have. Everyone who has used these tools seriously has one, and being able to explain how you now avoid it — plan review, targeted applies, lifecycle rules — shows the lesson landed.',
        'The habit worth naming is treating any plan that proposes to replace rather than update a stateful resource as a stop condition. It is a small discipline that prevents the single most common self-inflicted outage in this discipline.',
      ],
    },
    {
      heading: 'Observability and reliability',
      paragraphs: [
        'You will be asked what you monitor and how you know something is wrong. The weak answer is a list of metrics; the strong one connects metrics to user experience and describes an alert that would actually be acted on.',
        'Be ready to talk about alert fatigue. An environment where everyone ignores alerts is a common real situation, and describing how you reduced noise — deleting alerts, tying them to symptoms rather than causes — demonstrates judgement more than any tool name.',
        'Deleting alerts is the part candidates hesitate to say and the part interviewers want to hear. An alert nobody acts on is worse than no alert, because it trains the team to ignore the channel that the real one will arrive through.',
      ],
    },
    {
      heading: 'Kubernetes, in proportion',
      paragraphs: [
        'If the employer runs Kubernetes, expect depth: scheduling, probes, resource requests and limits, why a pod is stuck in a particular state. If they do not, it may barely come up — so find out before over-preparing.',
        'The question that separates users from operators is what happens when a pod fails a liveness probe under load, and how a too-aggressive probe can turn a slow service into a restart loop.',
        'Resource requests and limits are the adjacent trap. Being able to explain that requests drive scheduling while limits drive throttling and termination, and what happens when a memory limit is hit versus a CPU one, marks out someone who has debugged a cluster rather than read about one.',
      ],
      example: {
        title: 'The liveness probe restart loop',
        paragraphs: [
          'Scenario: under heavy load, pods begin restarting. Nothing in the application logs shows an error before each restart.',
          'The reasoning: restarts with no application error suggest something external is killing the container, and the liveness probe is the usual candidate. Under load the service responds more slowly; if the probe timeout is shorter than the loaded response time, the probe fails, the container is killed, its traffic shifts to the remaining pods, they slow further, and the loop accelerates.',
          'The fix has two parts. Immediately, loosen the probe timeout and failure threshold so a slow response is not treated as a dead process. Then separate liveness from readiness — readiness should remove a struggling pod from the load balancer, and liveness should only restart a genuinely wedged one. Using the same endpoint and thresholds for both is what turns a capacity problem into an outage.',
        ],
      },
    },
  ],
  faqs: [
    {
      q: 'What matters most in a DevOps interview?',
      a: 'The troubleshooting scenario. Tool familiarity is a filter; the decision usually comes down to whether you gather facts methodically before theorising about a cause.',
    },
    {
      q: 'How much Kubernetes do I need to know?',
      a: 'It depends entirely on the employer. Find out whether they run it before preparing deeply — plenty of good DevOps work happens without it, and container fundamentals matter more universally.',
    },
    {
      q: 'What is a strong answer about rollback?',
      a: 'That you test it deliberately rather than documenting it. Many teams have a rollback nobody has ever executed; describing a time yours did not work as expected is more convincing than describing one that always does.',
    },
    {
      q: 'How do I answer observability questions well?',
      a: 'Connect metrics to user experience rather than listing them, and talk about alert noise. Describing how you removed alerts nobody acted on shows more judgement than naming monitoring tools.',
    },
    {
      q: 'How do I answer "it passed CI but broke production"?',
      a: 'Talk about what CI did not cover — real data volumes, migration ordering, production-only configuration, or a dependency that behaves differently there.',
    },
    {
      q: 'What is the difference between requests and limits?',
      a: 'Requests drive scheduling; limits drive throttling and termination. Knowing what happens when a memory limit is hit versus a CPU one distinguishes someone who has debugged a cluster.',
    },
  ],
  related: ['devops-engineer-roadmap', 'cloud-engineer-roadmap', 'cybersecurity-interview-questions'],
  references: [
    {
      title: 'Workloads and controllers',
      url: 'https://kubernetes.io/docs/concepts/workloads/controllers/',
      publisher: 'Kubernetes',
      note: 'Probes, restarts and rolling updates, from the primary documentation.',
    },
    {
      title: 'Kubernetes concepts',
      url: 'https://kubernetes.io/docs/concepts/',
      publisher: 'Kubernetes',
      note: 'Worth reading before an interview at an employer that runs it.',
    },
  ],
};

export default post;
