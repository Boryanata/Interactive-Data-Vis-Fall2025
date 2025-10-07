// global scope
const fruit = "apple";
let transport = "car";
var planet = "earth";

console.log("_____________ Before ____________");
console.log("fruit:", fruit);
console.log("transport:", transport);
console.log("planet:", planet);

// // redeclaration
// // const fruit = "banana";
// // let transport = "bus";
// var planet = "mars";

// console.log("_____________ After redeclaration ____________");
// console.log("fruit:", fruit);
// console.log("transport:", transport);
// console.log("planet:", planet);

// // reassignment in global scope
// // fruit = "orange";
// transport = "plane";
// planet = "jupiter";

// console.log("_____________ After reassignment ____________");
// console.log("fruit:", fruit);
// console.log("transport:", transport);
// console.log("planet:", planet);

// function scope
function testScope() {
  const fruit = "banana";
  // let transport = "bus";
  // var planet = "pluto";
  transport = "bus";
  planet = "pluto";

  console.log("_____________ Inside function call ____________");
  console.log("fruit:", fruit);
  console.log("transport:", transport);
  console.log("planet:", planet);
}
testScope();

console.log("_____________ After ____________");
console.log("fruit:", fruit);
console.log("transport:", transport);
console.log("planet:", planet);
