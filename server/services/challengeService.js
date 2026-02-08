// Challenge Database (In production, use MongoDB/PostgreSQL)
const challenges = [
    {
        id: 'two-sum',
        title: 'Two Sum',
        difficulty: 'Easy',
        timeLimit: 300, // 5 minutes
        description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,

        examples: [
            {
                input: 'nums = [2,7,11,15], target = 9',
                output: '[0,1]',
                explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
            },
            {
                input: 'nums = [3,2,4], target = 6',
                output: '[1,2]'
            }
        ],

        constraints: [
            '2 <= nums.length <= 10^4',
            '-10^9 <= nums[i] <= 10^9',
            '-10^9 <= target <= 10^9',
            'Only one valid answer exists.'
        ],

        testCases: [
            { input: '2 7 11 15\n9', expectedOutput: '0 1' },
            { input: '3 2 4\n6', expectedOutput: '1 2' },
            { input: '3 3\n6', expectedOutput: '0 1' },
            { input: '1 5 3 7 9\n12', expectedOutput: '2 4' },
            { input: '-1 -2 -3 -4 -5\n-8', expectedOutput: '2 4' }
        ],

        starterCode: {
            javascript: `function twoSum(nums, target) {
    // Your code here
}

// Read input
const input = require('fs').readFileSync(0, 'utf-8').trim().split('\\n');
const nums = input[0].split(' ').map(Number);
const target = parseInt(input[1]);

const result = twoSum(nums, target);
console.log(result.join(' '));`,

            python: `def two_sum(nums, target):
    # Your code here
    pass

# Read input
import sys
lines = sys.stdin.read().strip().split('\\n')
nums = list(map(int, lines[0].split()))
target = int(lines[1])

result = two_sum(nums, target)
print(' '.join(map(str, result)))`,

            cpp: `#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Your code here
}

int main() {
    string line;
    getline(cin, line);
    istringstream iss(line);
    vector<int> nums;
    int num;
    while (iss >> num) nums.push_back(num);
    
    int target;
    cin >> target;
    
    vector<int> result = twoSum(nums, target);
    cout << result[0] << " " << result[1] << endl;
    return 0;
}`,

            java: `import java.util.*;

public class Solution {
    public static int[] twoSum(int[] nums, int target) {
        // Your code here
        return new int[]{};
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String[] numsStr = sc.nextLine().split(" ");
        int[] nums = new int[numsStr.length];
        for (int i = 0; i < numsStr.length; i++) {
            nums[i] = Integer.parseInt(numsStr[i]);
        }
        int target = sc.nextInt();
        
        int[] result = twoSum(nums, target);
        System.out.println(result[0] + " " + result[1]);
    }
}`
        }
    },

    {
        id: 'reverse-string',
        title: 'Reverse String',
        difficulty: 'Easy',
        timeLimit: 180, // 3 minutes
        description: `Write a function that reverses a string. The input string is given as an array of characters s.

You must do this by modifying the input array in-place with O(1) extra memory.`,

        examples: [
            {
                input: 's = ["h","e","l","l","o"]',
                output: '["o","l","l","e","h"]'
            },
            {
                input: 's = ["H","a","n","n","a","h"]',
                output: '["h","a","n","n","a","H"]'
            }
        ],

        constraints: [
            '1 <= s.length <= 10^5',
            's[i] is a printable ascii character.'
        ],

        testCases: [
            { input: 'hello', expectedOutput: 'olleh' },
            { input: 'Hannah', expectedOutput: 'hannaH' },
            { input: 'a', expectedOutput: 'a' },
            { input: 'racecar', expectedOutput: 'racecar' },
            { input: 'CodeClash', expectedOutput: 'hsalCedoC' }
        ],

        starterCode: {
            javascript: `function reverseString(s) {
    // Your code here
}

const input = require('fs').readFileSync(0, 'utf-8').trim();
console.log(reverseString(input));`,

            python: `def reverse_string(s):
    # Your code here
    pass

import sys
s = sys.stdin.read().strip()
print(reverse_string(s))`,

            cpp: `#include <iostream>
#include <string>
using namespace std;

string reverseString(string s) {
    // Your code here
}

int main() {
    string s;
    cin >> s;
    cout << reverseString(s) << endl;
    return 0;
}`,

            java: `import java.util.*;

public class Solution {
    public static String reverseString(String s) {
        // Your code here
        return "";
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        System.out.println(reverseString(s));
    }
}`
        }
    },

    {
        id: 'palindrome-number',
        title: 'Palindrome Number',
        difficulty: 'Easy',
        timeLimit: 240, // 4 minutes
        description: `Given an integer x, return true if x is a palindrome, and false otherwise.

An integer is a palindrome when it reads the same backward as forward.`,

        examples: [
            {
                input: 'x = 121',
                output: 'true',
                explanation: '121 reads as 121 from left to right and from right to left.'
            },
            {
                input: 'x = -121',
                output: 'false',
                explanation: 'From left to right, it reads -121. From right to left, it becomes 121-.'
            },
            {
                input: 'x = 10',
                output: 'false',
                explanation: 'Reads 01 from right to left.'
            }
        ],

        constraints: [
            '-2^31 <= x <= 2^31 - 1'
        ],

        testCases: [
            { input: '121', expectedOutput: 'true' },
            { input: '-121', expectedOutput: 'false' },
            { input: '10', expectedOutput: 'false' },
            { input: '0', expectedOutput: 'true' },
            { input: '12321', expectedOutput: 'true' }
        ],

        starterCode: {
            javascript: `function isPalindrome(x) {
    // Your code here
}

const input = parseInt(require('fs').readFileSync(0, 'utf-8').trim());
console.log(isPalindrome(input));`,

            python: `def is_palindrome(x):
    # Your code here
    pass

import sys
x = int(sys.stdin.read().strip())
print('true' if is_palindrome(x) else 'false')`,

            cpp: `#include <iostream>
using namespace std;

bool isPalindrome(int x) {
    // Your code here
}

int main() {
    int x;
    cin >> x;
    cout << (isPalindrome(x) ? "true" : "false") << endl;
    return 0;
}`,

            java: `import java.util.*;

public class Solution {
    public static boolean isPalindrome(int x) {
        // Your code here
        return false;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int x = sc.nextInt();
        System.out.println(isPalindrome(x));
    }
}`
        }
    }
];

class ChallengeService {
    getAllChallenges() {
        return challenges.map(c => ({
            id: c.id,
            title: c.title,
            difficulty: c.difficulty,
            timeLimit: c.timeLimit
        }));
    }

    getChallengeById(id) {
        return challenges.find(c => c.id === id);
    }

    getRandomChallenge() {
        return challenges[Math.floor(Math.random() * challenges.length)];
    }

    getStarterCode(challengeId, language) {
        const challenge = this.getChallengeById(challengeId);

        // FIX Bug #7: Handle missing challenge
        if (!challenge) {
            console.warn(`[CHALLENGE] Challenge ${challengeId} not found`);
            return `// Challenge not found\n// Please contact support\n`;
        }

        // FIX Bug #7: Handle missing language
        if (!challenge.starterCode[language]) {
            console.warn(`[CHALLENGE] No starter code for ${language} in ${challengeId}`);
            return `// Starter code not available for ${language}\n// Try switching to JavaScript or Python\n`;
        }

        return challenge.starterCode[language];
    }

    getTestCases(challengeId) {
        const challenge = this.getChallengeById(challengeId);

        // FIX Bug #7: Handle missing challenge
        if (!challenge) {
            console.warn(`[CHALLENGE] Challenge ${challengeId} not found`);
            return [];
        }

        return challenge.testCases || [];
    }
}

const challengeService = new ChallengeService();
export default challengeService;
