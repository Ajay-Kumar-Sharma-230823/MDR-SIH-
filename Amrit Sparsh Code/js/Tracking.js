/* ==========================================================
   Amrit Sparsh — MDR Tracking (Backend Connected Version)
   NO localStorage — all data persisted in backend
   ========================================================== */

// ==========================================================
// EQUIPMENT MODULE (Backend)
// ==========================================================

// Load equipment list from backend
async function loadEquipment() {
    const res = await fetch("http://127.0.0.1:8000/tracking/equipment");
    const data = await res.json();
    return data.equipment || [];
}

// Render equipment list
function drawEquipmentList(equipment) {
    const listEl = document.getElementById("equipmentList");
    listEl.innerHTML = "";

    equipment.forEach(item => {
        const wrapper = document.createElement("div");
        wrapper.className = "equipment-item";
        wrapper.dataset.id = item.id;

        const main = document.createElement("div");
        main.className = "equipment-main";

        const nameEl = document.createElement("div");
        nameEl.className = "equipment-name";
        nameEl.textContent = item.name;

        const metaEl = document.createElement("div");
        metaEl.className = "equipment-meta";

        const idSpan = document.createElement("span");
        idSpan.textContent = `ID: ${item.id}`;

        const typeSpan = document.createElement("span");
        typeSpan.textContent = item.type;

        metaEl.appendChild(idSpan);
        metaEl.appendChild(typeSpan);

        const lastUsedDiv = document.createElement("div");
        lastUsedDiv.className = "equipment-last";
        lastUsedDiv.textContent = "Usage stored in backend";

        main.appendChild(nameEl);
        main.appendChild(metaEl);
        main.appendChild(lastUsedDiv);

        const qrBox = document.createElement("div");
        qrBox.className = "equipment-qr";

        const img = document.createElement("img");
        img.src = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=AS|EQUIP|${item.id}`;
        img.alt = `QR preview for ${item.id}`;

        qrBox.appendChild(img);

        wrapper.appendChild(main);
        wrapper.appendChild(qrBox);

        listEl.appendChild(wrapper);
    });
}

// When clicking on equipment
function bindEquipmentClick() {
    const listEl = document.getElementById("equipmentList");
    const box = document.getElementById("selectedEquipmentBox");

    listEl.addEventListener("click", async evt => {
        const row = evt.target.closest(".equipment-item");
        if (!row) return;

        const id = row.dataset.id;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=AS|EQUIP|${id}`;

        if (navigator.clipboard) {
            try { await navigator.clipboard.writeText(id); } catch {}
        }

        box.innerHTML = `
            <h4>Selected equipment</h4>
            <p><strong>ID:</strong> ${id}</p>
            <p><strong>QR URL:</strong> <a href="${qrUrl}" target="_blank">${qrUrl}</a></p>
            <p style="font-size:0.75rem;color:#5c6c82;">ID copied to clipboard.</p>
        `;
    });
}

// Bind QR → patient link
function bindEquipmentLink() {
    const form = document.getElementById("linkForm");
    const statusEl = document.getElementById("linkStatus");

    form.addEventListener("submit", async evt => {
        evt.preventDefault();

        const eq = document.getElementById("equipmentSelect").value;
        let pid = document.getElementById("patientInput").value.trim();

        if (pid.startsWith("P-"))
            pid = pid.replace("P-", "");

        const response = await fetch("http://127.0.0.1:8000/tracking/equipment/link", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                equipment_id: eq,
                patient_id: parseInt(pid)
            })
        });

        if (!response.ok) {
            statusEl.textContent = "Error linking!";
            statusEl.style.color = "red";
            return;
        }

        statusEl.textContent = `Linked ${eq} → P-${pid}`;
        statusEl.style.color = "#0b63d6";

        setTimeout(() => (statusEl.textContent = ""), 2000);
    });
}

// Init Equipment Module
async function initEquipmentModule() {
    const list = await loadEquipment();
    drawEquipmentList(list);

    const select = document.getElementById("equipmentSelect");
    list.forEach(item => {
        const opt = document.createElement("option");
        opt.value = item.id;
        opt.textContent = `${item.name} (${item.id})`;
        select.appendChild(opt);
    });

    bindEquipmentClick();
    bindEquipmentLink();
}



// ==========================================================
// GRAPH MODULE (D3 + Backend)
// ==========================================================

async function loadGraphFromBackend() {
    const res = await fetch("http://127.0.0.1:8000/tracking/graph");
    return await res.json();
}

function initGraph(graphNodes, graphLinks) {
    const svg = d3.select("#exposureSvg");
    const svgNode = svg.node();

    const width = svgNode.clientWidth || 600;
    const height = svgNode.clientHeight || 360;

    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const rootGroup = svg.append("g");
    const linkGroup = rootGroup.append("g").attr("class", "links");
    const nodeGroup = rootGroup.append("g").attr("class", "nodes");

    svg.call(
        d3.zoom().scaleExtent([0.5, 2.5]).on("zoom", event =>
            rootGroup.attr("transform", event.transform)
        )
    );

    const simulation = d3
        .forceSimulation(graphNodes)
        .force(
            "link",
            d3.forceLink(graphLinks).id(d => d.id).distance(140)
        )
        .force("charge", d3.forceManyBody().strength(-300))
        .on("tick", tick);

    let linkSel = linkGroup.selectAll("line");
    let nodeSel = nodeGroup.selectAll("g");

    function render() {
        linkSel = linkSel
            .data(graphLinks)
            .join("line")
            .attr("stroke", "#aac")
            .attr("stroke-width", 2);

        const nodeEnter = nodeSel
            .data(graphNodes)
            .join(enter => {
                const g = enter.append("g").attr("class", "graph-node");

                g.append("circle")
                    .attr("r", 12)
                    .attr("fill", d =>
                        d.risk === "HIGH"
                            ? "#d7263d"
                            : d.risk === "LOW"
                            ? "#1ca94f"
                            : d.risk === "MODERATE"
                            ? "#ff9800"
                            : "#0b63d6"
                    )
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 2);

                g.append("text")
                    .attr("y", -16)
                    .attr("text-anchor", "middle")
                    .text(d => d.label);

                return g;
            });

        nodeSel = nodeEnter;
    }

    function tick() {
        linkSel
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        nodeSel.attr("transform", d => `translate(${d.x},${d.y})`);
    }

    render();
}

async function initGraphModule() {
    const graph = await loadGraphFromBackend();
    initGraph(graph.nodes, graph.links);
}


// ==========================================================
// BOOTSTRAP
// ==========================================================

document.addEventListener("DOMContentLoaded", async () => {
    await initEquipmentModule();
    await initGraphModule();
});
