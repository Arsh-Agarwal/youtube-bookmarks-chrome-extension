//listen to updates in tab system and find the we are currently on
console.log("background script loaded...")
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab)=>{
    console.log("url:", tab.url);
    if(tab.url && tab.url.includes("youtube.com/watch")){
        const queryParams = tab.url.split("?")[1];
        const urlParams = new URLSearchParams(queryParams);

        chrome.tabs.sendMessage(tabId, {
            type: "NEW",
            videoId: urlParams.get("v")
        });
    }
})