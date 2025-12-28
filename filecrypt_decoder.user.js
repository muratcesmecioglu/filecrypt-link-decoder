// ==UserScript==
// @name         FileCrypt DLC Decoder
// @namespace    FileCryptDecoder
// @version      1.0.0
// @description  Decode FileCrypt links using DLC method via dcrypt.it
// @author       Custom
// @grant        GM.xmlHttpRequest
// @match        http://filecrypt.cc/*
// @match        http://www.filecrypt.cc/*
// @match        http://filecrypt.co/*
// @match        http://www.filecrypt.co/*
// @match        https://filecrypt.cc/*
// @match        https://www.filecrypt.cc/*
// @match        https://filecrypt.co/*
// @match        https://www.filecrypt.co/*
// @run-at       document-end
// @connect      dcrypt.it
// @connect      self
// ==/UserScript==

(function () {
    'use strict';

    // Only run on Container pages
    if (!document.location.href.includes("/Container/")) {
        return;
    }

    // Create status message element
    const statusDiv = document.createElement("DIV");
    statusDiv.id = "dcryptStatus";
    statusDiv.style.cssText = `
        background-color: ${getBackgroundColor()};
        border-radius: 10px;
        padding: 1em;
        margin: 1em 0;
        color: ${getTextColor()};
        z-index: 10;
        position: relative;
    `;
    statusDiv.textContent = "🔄 Downloading DLC file...";

    // Insert before the download table
    const table = document.querySelector("table");
    if (table) {
        table.parentNode.insertBefore(statusDiv, table);
    }

    // Get DLC ID from the dlcdownload button
    const dlcButton = document.querySelector(".dlcdownload");
    if (!dlcButton) {
        statusDiv.textContent = "❌ No DLC download button found on this page.";
        statusDiv.style.color = "red";
        return;
    }

    // Extract DLC ID from data attribute (data-nppdd or similar)
    let dlcId = null;
    for (const attr of dlcButton.attributes) {
        if (attr.name.startsWith("data-")) {
            dlcId = attr.value;
            break;
        }
    }

    if (!dlcId) {
        // Try onclick attribute
        const onclick = dlcButton.getAttribute("onclick");
        if (onclick) {
            const match = onclick.match(/DownloadDLC\(['"]([^'"]+)['"]\)/);
            if (match) {
                dlcId = match[1];
            }
        }
    }

    if (!dlcId) {
        statusDiv.textContent = "❌ Could not find DLC ID.";
        statusDiv.style.color = "red";
        return;
    }

    console.log("DLC ID found:", dlcId);

    // Step 1: Download the DLC file
    const dlcUrl = `https://${document.location.hostname}/DLC/${dlcId}.dlc`;

    GM.xmlHttpRequest({
        method: "GET",
        url: dlcUrl,
        onload: function (response) {
            if (response.status !== 200) {
                statusDiv.textContent = `❌ Failed to download DLC file. Status: ${response.status}`;
                statusDiv.style.color = "red";
                return;
            }

            const dlcContent = response.responseText;
            console.log("DLC file downloaded, length:", dlcContent.length);
            statusDiv.textContent = "🔄 Decrypting via dcrypt.it...";

            // Step 2: POST to dcrypt.it
            decryptViaDcrypt(dlcContent, statusDiv);
        },
        onerror: function (error) {
            console.error("Error downloading DLC:", error);
            statusDiv.textContent = "❌ Error downloading DLC file.";
            statusDiv.style.color = "red";
        }
    });

    function decryptViaDcrypt(dlcContent, statusDiv) {
        GM.xmlHttpRequest({
            method: "POST",
            url: "http://dcrypt.it/decrypt/paste",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            data: "content=" + encodeURIComponent(dlcContent),
            onload: function (response) {
                console.log("dcrypt.it response:", response.responseText);

                try {
                    const result = JSON.parse(response.responseText);

                    if (result.success && result.success.links && result.success.links.length > 0) {
                        displayLinks(result.success.links, statusDiv);
                    } else if (result.error) {
                        statusDiv.textContent = `❌ dcrypt.it error: ${result.error}`;
                        statusDiv.style.color = "red";
                    } else {
                        statusDiv.textContent = "❌ No links found in response.";
                        statusDiv.style.color = "red";
                    }
                } catch (e) {
                    console.error("Error parsing response:", e);
                    statusDiv.textContent = "❌ Error parsing dcrypt.it response.";
                    statusDiv.style.color = "red";
                }
            },
            onerror: function (error) {
                console.error("Error calling dcrypt.it:", error);
                statusDiv.textContent = "❌ Error connecting to dcrypt.it";
                statusDiv.style.color = "red";
            }
        });
    }

    function displayLinks(links, statusDiv) {
        // Clear and update status div
        statusDiv.innerHTML = "";

        const header = document.createElement("SPAN");
        header.textContent = `✅ Decrypted ${links.length} link(s):`;
        header.style.fontWeight = "bold";
        statusDiv.appendChild(header);
        statusDiv.appendChild(document.createElement("BR"));
        statusDiv.appendChild(document.createElement("BR"));

        links.forEach((link, index) => {
            console.log(`Decrypted link ${index + 1}:`, link);

            const linkContainer = document.createElement("DIV");
            linkContainer.style.marginBottom = "8px";

            // Create clickable link
            const anchor = document.createElement("A");
            anchor.href = link;
            anchor.textContent = link;
            anchor.target = "_blank";
            anchor.style.cssText = `
                color: #4da6ff;
                text-decoration: none;
                word-break: break-all;
            `;
            anchor.addEventListener("mouseover", () => anchor.style.textDecoration = "underline");
            anchor.addEventListener("mouseout", () => anchor.style.textDecoration = "none");

            // Create copy button
            const copyBtn = document.createElement("BUTTON");
            copyBtn.textContent = "📋";
            copyBtn.title = "Copy to clipboard";
            copyBtn.style.cssText = `
                margin-left: 10px;
                cursor: pointer;
                padding: 2px 8px;
                border: none;
                border-radius: 4px;
                background: #333;
            `;
            copyBtn.addEventListener("click", () => {
                navigator.clipboard.writeText(link);
                copyBtn.textContent = "✓";
                setTimeout(() => copyBtn.textContent = "📋", 1500);
            });

            linkContainer.appendChild(anchor);
            linkContainer.appendChild(copyBtn);
            statusDiv.appendChild(linkContainer);
        });

        // Add "Copy All" button
        const copyAllBtn = document.createElement("BUTTON");
        copyAllBtn.textContent = "📋 Copy All Links";
        copyAllBtn.style.cssText = `
            margin-top: 15px;
            cursor: pointer;
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            background: #1B91DB;
            color: white;
            font-weight: bold;
        `;
        copyAllBtn.addEventListener("click", () => {
            navigator.clipboard.writeText(links.join("\n"));
            copyAllBtn.textContent = "✓ Copied!";
            setTimeout(() => copyAllBtn.textContent = "📋 Copy All Links", 1500);
        });
        statusDiv.appendChild(document.createElement("BR"));
        statusDiv.appendChild(copyAllBtn);
    }

    function getBackgroundColor() {
        const colorTag = document.head.querySelector('meta[name="theme-color"]');
        return colorTag ? "#0b0d15" : "white";
    }

    function getTextColor() {
        const colorTag = document.head.querySelector('meta[name="theme-color"]');
        return colorTag ? "white" : "black";
    }
})();
