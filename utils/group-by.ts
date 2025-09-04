/**
 * Groups an array of objects by a specified key.
 * @param array The array of objects to group.
 * @param key The key to group by.
 * @returns An object where keys are the values of the specified key,
 *          and values are arrays of objects from the input array.
 */
export function groupBy<T extends Record<string, any>, K extends keyof T>(
  array: T[],
  key: K
): Record<string, T[]> {
  return array.reduce((result, currentValue) => {
    // Get the value of the key for the current object
    const groupKey = currentValue[key];

    // If the key doesn't exist in the result object, create it with an empty array
    if (!result[groupKey]) {
      result[groupKey] = [];
    }

    // Push the current object to the array for this key
    result[groupKey].push(currentValue);

    return result;
  }, {} as Record<string, T[]>);
}
