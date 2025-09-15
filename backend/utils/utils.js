export const shuffleArray = (array) => {
  for (let i = array.length - 1; i >= 0; --i) {
    const randomIndex = Math.floor(Math.random() * i);
    [array[randomIndex], array[i]] = [array[i], array[randomIndex]];
  }
  return array;
};
