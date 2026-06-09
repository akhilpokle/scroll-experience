// Defines a debounce function to limit the rate at which a function can fire.
// To use in Liferay: Remove type annotations (: any, etc.) and save as .js file
export const debounce = (func: any, delay: number) => {
  let timerId: any; // Holds a reference to the timeout between calls.
  return (...args: any[]) => {
    clearTimeout(timerId); // Clears the current timeout, if any, to reset the debounce timer.
    timerId = setTimeout(() => {
        func.apply(this, args); // Calls the passed function after the specified delay with the correct context and arguments.
    }, delay);
  };
};
