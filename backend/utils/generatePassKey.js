import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";

import {
  pokemonCharacters,
  marvelCharacters,
  dcCharacters,
  planets,
  chemicalElements,
  weirdVocab,
  shortWords,
} from "./dictionary.js";
import crypto from "crypto";
import { shuffleArray } from "./utils.js";

const generateShortName = () => {
  const dictionaries = [
    dcCharacters,
    animals,
    marvelCharacters,
    colors,
    pokemonCharacters,
    planets,
    chemicalElements,
    weirdVocab,
    shortWords,
  ];
  const randomDictionaries = shuffleArray([...dictionaries]);
  const shortName = uniqueNamesGenerator({
    dictionaries: [adjectives, ...randomDictionaries],
    length: 2,
    style: "lowerCase",
    separator: "-",
  });
  return shortName;
};

const generateRandomString = () => {
  return crypto.randomBytes(3).toString("hex");
};

const generatePassKey = () => {
  const passKey = `${generateShortName()}-${generateRandomString()}`;
  return passKey;
};

// const findShortest = () => {
//   const dictionaries = {
//     adjectives,
//     dcCharacters,
//     animals,
//     marvelCharacters,
//     colors,
//     pokemonCharacters,
//     planets,
//     chemicalElements,
//     weirdVocab,
//     shortWords,
//   };
//   for (let key in dictionaries) {
//     const wordArr = [];

//     for (const word of dictionaries[key]) {
//       if (word.length < 4) {
//         wordArr.push(word);
//       }
//     }
//     console.log(key, wordArr);
//   }
// };
// findShortest();

export default generatePassKey;
