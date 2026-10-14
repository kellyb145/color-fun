// Pictures Kelly made with Gemini (cleaned up PNG line art in art/gemini/).
const pics = [
  ['lion', 'Lion'], ['elephant', 'Elephant'], ['giraffe', 'Giraffe'], ['monkey', 'Monkey'],
  ['kitty', 'Kitty'], ['puppy', 'Puppy'], ['piggy', 'Piggy'], ['cow-pig', 'Cow and Pig'],
  ['teddy', 'Teddy Bear'], ['unicorn', 'Unicorn'], ['dragon', 'Baby Dragon'], ['triceratops', 'Dino'],
  ['whale-shark', 'Whale Shark'], ['mermaid', 'Mermaid'], ['alien', 'Space Buddy'], ['rocket', 'Rocket'],
  ['car', 'Car'], ['fire-truck', 'Fire Truck'], ['ghost', 'Ghost'], ['pumpkin', 'Pumpkin'],
];
export default {
  id: 'friends', title: 'New Friends', icon: '🌟',
  pictures: pics.map(([id, title]) => ({ id: `gem-${id}`, title, src: `art/gemini/${id}.png` })),
};
