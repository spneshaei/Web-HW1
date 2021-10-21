stringInput = document.getElementById("stringInput");
hashInput = document.getElementById("hashInput");
stringOutput = document.getElementById("stringOutput");
hashOutput = document.getElementById("hashOutput");

async function findStringGo() {
    const response = await fetch('http://localhost/go/sha?sha256=' + hashInput.value, {
        method: 'GET',
    });
    const json = await response.json();
    if ((json.error != undefined) || json.result == undefined) {
        alert("Error: " + json.error);
        return;
    }
    stringOutput.innerHTML = json.result;
}