document.querySelector("head>title").innerHTML = SKETCH;
document.querySelector("main h1").innerHTML = SKETCH;

window.addEventListener('load', ()=> {
    const ce = document.querySelectorAll("canv")
    for(let i = 0; i < ce.length; i++) {
        const canv = document.getElementById("defaultCanvas" + i);
        document.querySelector("main").removeChild(canv);
        ce[i].appendChild(canv);
    }
});