let pyodide;
let currentProblem;

async function loadPyodideAndPackages() {
  pyodide = await loadPyodide();
  console.log("Pyodide loaded!");
}
loadPyodideAndPackages();

async function runCustomTest() {
  const code = document.getElementById("code").value;
  const input = document.getElementById("stdin").value;

  try {
    const wrappedCode = `
import sys
from io import StringIO
sys.stdin = StringIO("""${input}""")
sys.stdout = StringIO()
${code}
output = sys.stdout.getvalue()
`;
    await pyodide.runPythonAsync(wrappedCode);
    const output = pyodide.globals.get("output").trim();
    document.getElementById("output").innerText = output;
  } catch (err) {
    document.getElementById("output").innerText = "Error: " + err;
  }
}

async function submitCode() {
  const code = document.getElementById("code").value;
  let results = [];

  for (let tc of currentProblem.test_cases) {
    const wrappedCode = `
import sys
from io import StringIO
sys.stdin = StringIO("""${tc.input}""")
sys.stdout = StringIO()
${code}
output = sys.stdout.getvalue()
`;
    try {
      await pyodide.runPythonAsync(wrappedCode);
      const output = pyodide.globals.get("output").trim();
      const passed = output === tc.expected;
      results.push(passed ? "✅ Passed" : `❌ Failed (Input: ${tc.input}, Expected: ${tc.expected}, Got: ${output})`);
    } catch (err) {
      results.push("❌ Runtime Error: " + err);
    }
  }

  document.getElementById("output").innerText = results.join("\n");
}



async function loadProblem(index) {
  const res = await fetch(`problems/problem${index}.json`);
  currentProblem = await res.json();

  document.getElementById("title").innerText = currentProblem.title;
  document.getElementById("desc").innerText = currentProblem.description;
  document.getElementById("sample-input").innerText = currentProblem.sample_input || "";
  document.getElementById("sample-output").innerText = currentProblem.sample_output || "";
  document.getElementById("code").value = currentProblem.starter_code;
  document.getElementById("stdin").value = currentProblem.input || "";
}


function listProblems() {
  for (let i = 1; i <= 2; i++) {
    const li = document.createElement("li");
    li.innerText = `Problem ${i}`;
    li.onclick = () => loadProblem(i);
    document.getElementById("problem-list").appendChild(li);
  }
}
listProblems();
