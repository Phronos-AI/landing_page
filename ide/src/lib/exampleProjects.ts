// Example projects for Phronos IDE demo
// Examples only contain descriptions - tests are generated via 'phronos compile'

export interface ExampleProject {
  id: string;
  name: string;
  difficulty: "easy" | "medium" | "hard";
  description: string;
}

export const EXAMPLE_PROJECTS: ExampleProject[] = [
  {
    id: "fibonacci",
    name: "Fibonacci Sequence",
    difficulty: "easy",
    description: `# Fibonacci Sequence

Write a function that calculates the nth Fibonacci number.

## Requirements
- Function should be named \`fibonacci\`
- Takes a single integer parameter \`n\` (0-indexed)
- Returns the nth Fibonacci number
- Handle edge cases (n = 0, n = 1)
- Should be efficient for reasonable inputs (n < 50)

## Example
\`\`\`
fibonacci(0) → 0
fibonacci(1) → 1
fibonacci(5) → 5
fibonacci(10) → 55
fibonacci(15) → 610
\`\`\`

## Language
Python

## Notes
The Fibonacci sequence is: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144...
Each number is the sum of the two preceding ones.
`,
  },
  {
    id: "string-reverse",
    name: "String Reversal with Edge Cases",
    difficulty: "easy",
    description: `# String Reversal

Write a function that reverses a string while handling various edge cases.

## Requirements
- Function should be named \`reverse_string\`
- Takes a single string parameter \`s\`
- Returns the reversed string
- Handle empty strings
- Handle single character strings
- Preserve Unicode characters correctly
- Handle strings with spaces and special characters

## Example
\`\`\`
reverse_string("hello") → "olleh"
reverse_string("") → ""
reverse_string("a") → "a"
reverse_string("Hello World!") → "!dlroW olleH"
reverse_string("12345") → "54321"
\`\`\`

## Language
Python
`,
  },
  {
    id: "binary-search",
    name: "Binary Search Implementation",
    difficulty: "medium",
    description: `# Binary Search

Implement a binary search algorithm that finds the index of a target value in a sorted array.

## Requirements
- Function should be named \`binary_search\`
- Takes two parameters: \`arr\` (sorted list of integers) and \`target\` (integer to find)
- Returns the index of target if found, -1 if not found
- Must use binary search algorithm (O(log n) time complexity)
- Array is guaranteed to be sorted in ascending order
- Handle empty arrays
- Handle single element arrays

## Example
\`\`\`
binary_search([1, 2, 3, 4, 5], 3) → 2
binary_search([1, 2, 3, 4, 5], 6) → -1
binary_search([10, 20, 30, 40, 50], 10) → 0
binary_search([10, 20, 30, 40, 50], 50) → 4
binary_search([], 5) → -1
\`\`\`

## Language
Python
`,
  },
  {
    id: "lru-cache",
    name: "LRU Cache",
    difficulty: "medium",
    description: `# LRU Cache

Design and implement a Least Recently Used (LRU) cache data structure.

## Requirements
- Class should be named \`LRUCache\`
- Constructor takes \`capacity\` parameter (maximum number of items)
- Implement \`get(key)\` method:
  - Returns the value if key exists
  - Returns -1 if key doesn't exist
  - Updates the key as recently used
- Implement \`put(key, value)\` method:
  - Inserts or updates the value for a key
  - If cache is at capacity, evict the least recently used item
- Both operations should run in O(1) time complexity

## Example
\`\`\`
cache = LRUCache(2)
cache.put(1, 1)
cache.put(2, 2)
cache.get(1)      → 1
cache.put(3, 3)   # evicts key 2
cache.get(2)      → -1 (not found)
cache.put(4, 4)   # evicts key 1
cache.get(1)      → -1 (not found)
cache.get(3)      → 3
cache.get(4)      → 4
\`\`\`

## Language
Python
`,
  },
  {
    id: "merge-intervals",
    name: "Merge Overlapping Intervals",
    difficulty: "hard",
    description: `# Merge Intervals

Given a list of intervals, merge all overlapping intervals and return a list of non-overlapping intervals.

## Requirements
- Function should be named \`merge_intervals\`
- Takes a list of intervals (each interval is a list [start, end])
- Returns a list of merged intervals
- Intervals are inclusive on both ends
- Input intervals may not be sorted
- Handle empty input
- Handle single interval

## Example
\`\`\`
merge_intervals([[1,3],[2,6],[8,10],[15,18]]) → [[1,6],[8,10],[15,18]]
merge_intervals([[1,4],[4,5]]) → [[1,5]]
merge_intervals([[1,4],[0,4]]) → [[0,4]]
merge_intervals([[1,4],[0,1]]) → [[0,4]]
merge_intervals([]) → []
\`\`\`

## Language
Python

## Notes
- Two intervals [a,b] and [c,d] overlap if b >= c (assuming a <= c)
- When merging, take min of starts and max of ends
`,
  },
];

export function getExampleById(id: string): ExampleProject | null {
  return EXAMPLE_PROJECTS.find((ex) => ex.id === id) || null;
}

export function listExamples(): ExampleProject[] {
  return EXAMPLE_PROJECTS;
}

