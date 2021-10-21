stringInput = document.getElementById("stringInput");
hashInput = document.getElementById("hashInput");
stringOutput = document.getElementById("stringOutput");
hashOutput = document.getElementById("hashOutput");

async function findStringGo() {
    const response = await fetch('http://localhost/go/sha', {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        // body: JSON.stringify({
        //     'sha256': hashInput.value
        // })
    });
    const json = await response.json();
    if ((json.error != undefined) || json.result == undefined) {
        alert("Error: " + json.error);
        return;
    }
    console.log("h");
    stringOutput.innerHTML = json.result;
}