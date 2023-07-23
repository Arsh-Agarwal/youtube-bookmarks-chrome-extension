import { getCurrentTab } from "./utils.js";
console.log("loaded index.js!");

const viewBMs = (currentVidBMs=[]) => {
    console.log("showing bms: ", currentVidBMs);
    const bmElement = document.getElementById("bookmarks");
    console.log("bm container: ", bmElement);
    bmElement.innerHTML = "";
    if(currentVidBMs.length > 0){
        for (let i = 0; i < currentVidBMs.length; i++){
            const bm = currentVidBMs[i];
            addNewBM(bmElement, bm);
        }
    }else {
        bmElement.innerHTML = '<em class="row">No bookmarks to show</em>';
    }
};

const onPlay = async e => {
    const bmTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    console.log("Triggerred play at: " + bmTime);
    const activeTab = await getCurrentTab();
    chrome.tabs.sendMessage(activeTab.id, {
        type: "PLAY",
        value: bmTime
    });
};

const onDelete = async e => {
    const activeTab = await getCurrentTab();
    const bmTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    console.log("deleting bm with timestamp (index.js): ", bmTime);
    //const elementToDelete = document.getElementById("bookmark-"+bmTime);
    chrome.tabs.sendMessage(activeTab.id, {
        type: "DELETE",
        value: bmTime
    }, viewBMs); 
};

const setBMAttributes = (src, eventListener, controlParentElement) => {
    const controlElement = document.createElement("img");
    controlElement.src = "assets/" + src + ".png";
    controlElement.title = src;
    controlElement.className = "bookmark-controls";
    controlElement.addEventListener("click", eventListener);
    controlParentElement.appendChild(controlElement);
};

const addNewBM = (bmElement, bm) => {
    const titleElement = document.createElement("p");
    const newBMElement = document.createElement("div");
    const controlElement = document.createElement("div");

    titleElement.textContent = bm.desc;
    console.log("title element: ", titleElement);
    titleElement.className = "bookmark-text";

    newBMElement.id = "bookmark-"+bm.time;
    newBMElement.className = "bookmark";
    newBMElement.setAttribute("timestamp", bm.time);

    setBMAttributes("play", onPlay, controlElement);
    setBMAttributes("delete",onDelete, controlElement);
    controlElement.className = "controls-container";

    newBMElement.appendChild(titleElement);
    newBMElement.appendChild(controlElement);
    bmElement.appendChild(newBMElement); 
};

document.addEventListener("DOMContentLoaded", async () => {

    console.log("DOM Content loaded.");
    const activeTab = await getCurrentTab();
    const queryParameters = activeTab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);

    console.log("Detecting video.");
    const currentVideo = urlParameters.get("v");
    if(activeTab.url.includes("youtube.com/watch") && currentVideo){
        console.log("Found YT video page.");
        chrome.storage.sync.get([currentVideo], (data) => {
            const currentVidBMs = data[currentVideo] ? JSON.parse(data[currentVideo]) : [];
            viewBMs(currentVidBMs);
        });
    }else{
        //not on a youtube watch page
        console.log("Not a YT video page.");
        const container = document.getElementsByClassName("container")[0];
        container.innerHTML = '<div class="title">This is not a youtube video page.</div>';
    }
});