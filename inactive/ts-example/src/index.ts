// https://github.com/azu/parcel-typescript-example

const hello = () => {
    return "Hello World!";
};
// main
const main = document.getElementById("js-main");
if (main) {
    main.textContent = hello();
}
