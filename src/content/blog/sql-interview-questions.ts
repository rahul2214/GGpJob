import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'sql-interview-questions',
  tint: 'sky',
  title: 'Top SQL Interview Questions and Answers (Beginner to Advanced)',
  heading: 'SQL interview questions and answers',
  description:
    'The SQL interview questions asked most often for data analyst, data engineer and backend roles: joins, GROUP BY, window functions, subqueries, indexes and query optimisation — with example queries.',
  keywords: [
    'sql interview questions',
    'sql interview questions and answers',
    'sql queries for interview',
    'window functions interview questions',
    'sql joins interview questions',
  ],
  publishedAt: '2026-10-29',
  updatedAt: '2026-10-29',
  author: 'JobsDart Editorial',
  readingMinutes: 10,
  category: 'Interviews',
  anchors: ['SQL interview questions'],
  excerpt:
    'Almost every data and backend interview includes SQL. These are the concepts and query patterns that come up most, with short answers and examples you can practise on any PostgreSQL or MySQL database.',
  keyTakeaways: [
    'Master joins, GROUP BY with HAVING, and window functions — they cover most practical questions.',
    'Know the difference between WHERE and HAVING, and between INNER, LEFT and FULL joins.',
    'Be able to find duplicates, the Nth highest value, and running totals from memory.',
    'For senior roles, expect questions on indexes, query plans and transactions.',
  ],
  sections: [
    {
      heading: 'Core concept questions',
      paragraphs: [],
      table: {
        caption: 'Frequently asked SQL concept questions with short answers',
        columns: ['Question', 'Short answer'],
        rows: [
          ['WHERE vs HAVING?', 'WHERE filters rows before grouping; HAVING filters groups after aggregation.'],
          ['INNER vs LEFT JOIN?', 'INNER returns only matching rows; LEFT returns all rows from the left table with NULLs where there is no match.'],
          ['DELETE vs TRUNCATE vs DROP?', 'DELETE removes selected rows and can be filtered; TRUNCATE removes all rows quickly; DROP removes the table itself.'],
          ['UNION vs UNION ALL?', 'UNION removes duplicates; UNION ALL keeps them and is faster.'],
          ['Primary key vs unique key?', 'Both enforce uniqueness; a table has one primary key, which cannot be NULL, but can have many unique constraints.'],
          ['What is normalisation?', 'Organising tables to reduce redundancy, typically to third normal form, so each fact is stored once.'],
          ['What is an index?', 'A data structure (often a B-tree) that speeds up lookups on columns at the cost of extra storage and slower writes.'],
          ['What is a transaction?', 'A group of statements that succeed or fail together, following ACID properties.'],
        ],
      },
    },
    {
      heading: 'Query patterns you should write from memory',
      paragraphs: ['These examples use a simple employees(id, name, department, salary, hired_at) table.'],
      example: {
        title: 'Common interview queries',
        paragraphs: [
          'Second highest salary: SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees);',
          'Nth highest with a window function: SELECT salary FROM (SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS r FROM employees) t WHERE r = 3;',
          'Find duplicates: SELECT name, COUNT(*) FROM employees GROUP BY name HAVING COUNT(*) > 1;',
          'Top earner per department: SELECT * FROM (SELECT *, ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS rn FROM employees) t WHERE rn = 1;',
          'Running total of hires by month: SELECT month, hires, SUM(hires) OVER (ORDER BY month) AS running_total FROM monthly_hires;',
        ],
      },
    },
    {
      heading: 'Window functions explained',
      paragraphs: [
        'Window functions calculate a value across a set of related rows without collapsing them into one row like GROUP BY does. ROW_NUMBER gives a unique sequence, RANK leaves gaps after ties, and DENSE_RANK does not. LAG and LEAD read the previous or next row, which makes month-over-month comparisons easy.',
      ],
    },
    {
      heading: 'Advanced and performance questions',
      paragraphs: [],
      bullets: [
        'How would you find why a query is slow? (Read the execution plan with EXPLAIN or EXPLAIN ANALYZE, look for sequential scans and large sorts.)',
        'When would an index not be used? (Low selectivity, functions on the column, leading wildcard LIKE, or small tables.)',
        'What is a composite index and why does column order matter?',
        'Explain isolation levels and problems like dirty reads and phantom reads.',
        'What is the difference between a CTE and a subquery, and when is a recursive CTE useful?',
      ],
    },
  ],
  practicalSteps: [
    { step: 1, title: 'Set up a practice database', description: 'Install PostgreSQL locally or use a free online SQL sandbox with sample data.' },
    { step: 2, title: 'Drill the patterns', description: 'Write each query in this guide without notes until it takes under two minutes.' },
    { step: 3, title: 'Explain while you type', description: 'Practise narrating your approach, as interviewers score reasoning as well as correctness.' },
  ],
  faqs: [
    { q: 'Which SQL dialect should I learn for interviews?', a: 'Standard SQL with PostgreSQL or MySQL is enough for most interviews. Syntax differences are minor and interviewers rarely penalise them.' },
    { q: 'Are window functions asked for analyst roles?', a: 'Yes. ROW_NUMBER, RANK and running totals are among the most common analyst interview topics.' },
  ],
  related: [
    'how-to-become-a-data-analyst',
    'data-engineer-interview-questions',
    'data-analyst-vs-data-scientist-skills-salaries-jobs',
  ],
  references: [
    { title: 'PostgreSQL Tutorial', url: 'https://www.postgresql.org/docs/current/tutorial.html', publisher: 'PostgreSQL', note: 'The official introduction to SQL concepts and queries.' },
    { title: 'Window Functions', url: 'https://www.postgresql.org/docs/current/tutorial-window.html', publisher: 'PostgreSQL', note: 'Official explanation of window functions with examples.' },
  ],
};

export default post;
