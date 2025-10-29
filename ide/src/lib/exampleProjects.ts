// Example projects for Phronos IDE demo

export interface ExampleProject {
  id: string;
  name: string;
  difficulty: "easy" | "medium" | "hard";
  description: string;
  tests: string;
  language: string;
}

export const EXAMPLE_PROJECTS: ExampleProject[] = [
  {
    id: "fibonacci",
    name: "Fibonacci Sequence",
    difficulty: "easy",
    language: "python",
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

## Notes
The Fibonacci sequence is: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144...
Each number is the sum of the two preceding ones.
`,
    tests: `import pytest

def test_fibonacci_base_cases():
    assert fibonacci(0) == 0
    assert fibonacci(1) == 1

def test_fibonacci_small_values():
    assert fibonacci(2) == 1
    assert fibonacci(3) == 2
    assert fibonacci(4) == 3
    assert fibonacci(5) == 5

def test_fibonacci_medium_values():
    assert fibonacci(10) == 55
    assert fibonacci(15) == 610
    assert fibonacci(20) == 6765

def test_fibonacci_larger_values():
    assert fibonacci(30) == 832040
    assert fibonacci(40) == 102334155
`,
  },
  {
    id: "string-reverse",
    name: "String Reversal with Edge Cases",
    difficulty: "easy",
    language: "python",
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
`,
    tests: `import pytest

def test_reverse_basic():
    assert reverse_string("hello") == "olleh"
    assert reverse_string("world") == "dlrow"

def test_reverse_empty_and_single():
    assert reverse_string("") == ""
    assert reverse_string("a") == "a"

def test_reverse_with_spaces():
    assert reverse_string("hello world") == "dlrow olleh"
    assert reverse_string("  spaces  ") == "  secaps  "

def test_reverse_with_special_chars():
    assert reverse_string("Hello, World!") == "!dlroW ,olleH"
    assert reverse_string("12345") == "54321"
    assert reverse_string("a!b@c#") == "#c@b!a"

def test_reverse_longer_strings():
    assert reverse_string("The quick brown fox") == "xof nworb kciuq ehT"
`,
  },
  {
    id: "binary-search",
    name: "Binary Search Implementation",
    difficulty: "medium",
    language: "python",
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
`,
    tests: `import pytest

def test_binary_search_found():
    assert binary_search([1, 2, 3, 4, 5], 3) == 2
    assert binary_search([1, 2, 3, 4, 5], 1) == 0
    assert binary_search([1, 2, 3, 4, 5], 5) == 4

def test_binary_search_not_found():
    assert binary_search([1, 2, 3, 4, 5], 6) == -1
    assert binary_search([1, 2, 3, 4, 5], 0) == -1
    assert binary_search([2, 4, 6, 8], 5) == -1

def test_binary_search_edge_cases():
    assert binary_search([], 1) == -1
    assert binary_search([1], 1) == 0
    assert binary_search([1], 2) == -1

def test_binary_search_larger_arrays():
    arr = list(range(0, 100, 2))  # [0, 2, 4, 6, ..., 98]
    assert binary_search(arr, 50) == 25
    assert binary_search(arr, 0) == 0
    assert binary_search(arr, 98) == 49
    assert binary_search(arr, 51) == -1

def test_binary_search_duplicates():
    # If duplicates exist, any valid index is acceptable
    arr = [1, 2, 2, 2, 3, 4, 5]
    result = binary_search(arr, 2)
    assert result in [1, 2, 3]
`,
  },
  {
    id: "lru-cache",
    name: "LRU Cache",
    difficulty: "medium",
    language: "python",
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
`,
    tests: `import pytest

def test_lru_basic_operations():
    cache = LRUCache(2)
    cache.put(1, 1)
    cache.put(2, 2)
    assert cache.get(1) == 1
    assert cache.get(2) == 2

def test_lru_eviction():
    cache = LRUCache(2)
    cache.put(1, 1)
    cache.put(2, 2)
    cache.get(1)
    cache.put(3, 3)  # evicts key 2
    assert cache.get(2) == -1

def test_lru_update_existing():
    cache = LRUCache(2)
    cache.put(1, 1)
    cache.put(2, 2)
    cache.put(1, 10)  # update value
    assert cache.get(1) == 10

def test_lru_complex_scenario():
    cache = LRUCache(2)
    cache.put(1, 1)
    cache.put(2, 2)
    assert cache.get(1) == 1
    cache.put(3, 3)  # evicts key 2
    assert cache.get(2) == -1
    cache.put(4, 4)  # evicts key 1
    assert cache.get(1) == -1
    assert cache.get(3) == 3
    assert cache.get(4) == 4

def test_lru_single_capacity():
    cache = LRUCache(1)
    cache.put(1, 1)
    assert cache.get(1) == 1
    cache.put(2, 2)  # evicts key 1
    assert cache.get(1) == -1
    assert cache.get(2) == 2
`,
  },
  {
    id: "merge-intervals",
    name: "Merge Overlapping Intervals",
    difficulty: "hard",
    language: "python",
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

## Notes
- Two intervals [a,b] and [c,d] overlap if b >= c (assuming a <= c)
- When merging, take min of starts and max of ends
`,
    tests: `import pytest

def test_merge_intervals_basic():
    result = merge_intervals([[1, 3], [2, 6], [8, 10], [15, 18]])
    assert result == [[1, 6], [8, 10], [15, 18]]

def test_merge_intervals_touching():
    result = merge_intervals([[1, 4], [4, 5]])
    assert result == [[1, 5]]

def test_merge_intervals_unsorted():
    result = merge_intervals([[1, 4], [0, 4]])
    assert result == [[0, 4]]
    
    result = merge_intervals([[2, 3], [4, 5], [6, 7], [8, 9], [1, 10]])
    assert result == [[1, 10]]

def test_merge_intervals_no_overlap():
    result = merge_intervals([[1, 2], [3, 4], [5, 6]])
    assert result == [[1, 2], [3, 4], [5, 6]]

def test_merge_intervals_edge_cases():
    assert merge_intervals([]) == []
    assert merge_intervals([[1, 1]]) == [[1, 1]]
    assert merge_intervals([[1, 5]]) == [[1, 5]]

def test_merge_intervals_all_overlap():
    result = merge_intervals([[1, 10], [2, 6], [3, 8], [4, 9]])
    assert result == [[1, 10]]

def test_merge_intervals_complex():
    result = merge_intervals([[1, 3], [2, 6], [8, 10], [9, 12], [15, 18]])
    assert result == [[1, 6], [8, 12], [15, 18]]
`,
  },
];

export function getExampleById(id: string): ExampleProject | null {
  return EXAMPLE_PROJECTS.find((ex) => ex.id === id) || null;
}

export function listExamples(): ExampleProject[] {
  return EXAMPLE_PROJECTS;
}

