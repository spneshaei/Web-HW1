// MARK: HTML outlets

stringInput = document.getElementById("stringInput");
hashInput = document.getElementById("hashInput");
output = document.getElementById("output");

// MARK: String to Hash

async function findHash(backendType) { // backendType = go | node
    if (stringInput.value.length < 8) {
        alert("Input string can't be less than 8 characters long")
        return;
    }
    output.innerHTML = "Loading..."
    const response = await fetch('http://localhost/' + backendType + '/sha', {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"string": stringInput.value})
    });
    const json = await response.json();
    if ((json.error != undefined) || json.result == undefined) {
        output.innerHTML = ""
        alert("Error: " + json.error);
        return;
    }
    output.innerHTML = json.result;
}

async function findHashGo() {
    await findHash('go')
}

async function findHashNode() {
    await findHash('node')
}

// MARK: Hash to String

async function findString(backendType) { // backendType = go | node
    output.innerHTML = "Loading..."
    const response = await fetch('http://localhost/' + backendType +
     '/sha?sha256=' + encodeURIComponent(hashInput.value), {
        method: 'GET',
    });
    const json = await response.json();
    if ((json.error != undefined) || json.result == undefined) {
        output.innerHTML = ""
        alert("Error: " + json.error);
        return;
    }
    output.innerHTML = json.result;
}

async function findStringGo() {
    await findString('go')
}

async function findStringNode() {
    await findString('node')
}