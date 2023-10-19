const { getRandomActivities } = require('./App.js'); 

describe('getRandomActivities', () => {
  test('it should return an array of 3 random activities', () => {
    // Mock the activities array for testing
    const activities = ['Activity 1', 'Activity 2', 'Activity 3', 'Activity 4', 'Activity 5'];

    // Mock the Math.random function to return a fixed value for testing
    const originalMathRandom = Math.random;
    Math.random = jest.fn(() => 0.25);

    const result = getRandomActivities(activities);

    // Restore the original function
    Math.random = originalMathRandom;

    // Check for 3 elements
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(3);

    // Check 3 unique activities
    expect([...new Set(result)]).toEqual(expect.arrayContaining(activities));

    // Check no extra activities
    expect(result).not.toEqual(expect.arrayContaining(activities.slice(3)));
  });
});
