console.log("content script loaded");
( () =>{
    let ytControls, ytPlayer;
    let currentVideo = "";
    let curBMS = [];

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        console.log("msg received: ", obj);
        const {type, value, videoId} = obj;
        if(type==="NEW"){
            currentVideo = videoId;
            newVideoLoader();
        } else if(type==="PLAY"){
            ytPlayer.currentTime = value;
        } else if(type==="DELETE"){
            console.log("deleting bm with timestamp: ", value, "current video: ", currentVideo);
            curBMS = curBMS.filter((b) => b.time!=value);
            chrome.storage.sync.set({[currentVideo]: JSON.stringify(curBMS)});
            response(curBMS);
        }
    }); 

    const fetchBMS = () => {
        return new Promise((resolve) => {
            chrome.storage.sync.get([currentVideo], (obj) => {
                resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
            });
        });
    }

    const newVideoLoader = async () => {
        console.log("loading new video");
        
        curBMS = await fetchBMS();
        console.log("current video: ", currentVideo, "current BMS: ", curBMS);

        console.log("checking if button already exists...");
        const btnExists = document.getElementsByClassName("bookmark-btn")[0];
        console.log("btn exists: ", btnExists);

        if(!btnExists){
            console.log("adding btn...");
            const btn = document.createElement("img");

            btn.src = chrome.runtime.getURL("assets/bookmark.png");
            btn.className = "bookmark-btn";
            btn.title = "Bookmark current timestamp";

            ytControls = document.getElementsByClassName('ytp-right-controls')[0];
            ytPlayer = document.getElementsByClassName('video-stream')[0];

            ytControls.insertBefore(btn, ytControls.firstChild);
            btn.addEventListener("click", newBMHandler);
        }
    }

    const newBMHandler = async () => {
        const currentTime = ytPlayer.currentTime;
        const newBM = {
            time: currentTime,
            desc: "Bookmark at " + getTime(currentTime)
        };
        console.log("New BM: ", newBM);

        curBMS = await fetchBMS();

        chrome.storage.sync.set({
            [currentVideo]: JSON.stringify([...curBMS, newBM].sort((a, b) => a.time - b.time))
        });
    }
})();

const getTime = t => {
    var date = new Date(0);
    date.setSeconds(t);
    return date.toISOString().substr(11, 8);
}