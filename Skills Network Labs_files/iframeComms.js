// part 1: shared variables and functions used inside ui_requests.js, iframe_comms.js and html script tags


window.theia_frame;
window.theia_origin;
window.author_ide_frame;
window.author_ide_origin;

function setFramesOrigin(author_ide_url, theia_url) {
  try {
    window.theia_origin = new URL(theia_url).origin;
  }
  catch (e) {
    window.theia_origin = ""
  }
  window.author_ide_origin = author_ide_url;
}


// part 2: run once; starts listening to requests from author_ide and theia
function commsBetweenIframes() {
  console.log("adding message event listeners");
  window.addEventListener('message', (event) => {
    if (event.origin != window.theia_origin && event.origin != window.author_ide_origin) return
    if (event && event.data) {
      const type = event.data.type;
      switch (type) {
        case "current_ui_url":
          console.log("received message from the child iframe requesting ui's current url")
          if (window.theia_frame) {
            let mess = {
              type: "current_ui_url",
              URL: window.location.href
            };
            window.theia_frame.postMessage(mess, window.theia_origin);
            console.log("sent ui's current url to the iframe")
          };
          break;
        case "execute_code":
          console.log("received message from the author_ide iframe to execute command")
          if (window.theia_frame == undefined) {
            window.theia_frame = window.frames.tool_iframe_name;
          }
          if (window.theia_frame) {
            let mess = {
              type: "execute_code",
              command: event.data.command
            };
            window.theia_frame.postMessage(mess, window.theia_origin);
            console.log("sent the command to be execute to the theia_iframe")
          };
          break;
        case "launch_application":
          console.log("received message from the author_ide iframe to launch_application")
          if (window.theia_frame) {
            let mess = {
              type: "launch_application",
              port: event.data.port,
              viewType: event.data.viewType,
              route: event.data.route
            }
            window.theia_frame.postMessage(mess, window.theia_origin);
            console.log("sent the request to open an application to the theia_iframe");
          }
          break;
        case "open_file":
          console.log("received message from the author_ide iframe to open file")
          if (window.theia_frame == undefined) {
            window.theia_frame = window.frames.tool_iframe_name;
          }
          if (window.theia_frame) {
            let uri = event.data.uri.startsWith('./') ? event.data.uri.substring(2) : event.data.uri;
            uri = uri.startsWith('/') ? uri : "/home/project/" + uri;
            let mess = {
              type: "open_file",
              uri: uri
            }
            window.theia_frame.postMessage(mess, window.theia_origin);
            console.log("sent the request to open a file to the theia_iframe");
          }
          break;
        case "open_db_page":
          if (window.theia_frame) {
            let mess = {
              type: "open_db_page",
              db: event.data.db,
              start: event.data.start
            }
            window.theia_frame.postMessage(mess, window.theia_origin);
            console.log("sent the request to open a db page to the theia_iframe");
          }
          break;
        case "open_big_data_page":
          if (window.theia_frame) {
            let mess = {
              type: "open_big_data_page",
              tool: event.data.tool,
              start: event.data.start
            }
            window.theia_frame.postMessage(mess, window.theia_origin);
            console.log("sent the request to open a big data page to the theia_iframe");
          }
          break;
        case "open_cloud_page":
          if (window.theia_frame) {
            let mess = {
              type: "open_cloud_page",
              tool: event.data.tool,
              action: event.data.action
            }
            window.theia_frame.postMessage(mess, window.theia_origin);
            console.log("sent the request to open a cloud page to the theia_iframe");
          }
          break;
        case "open_embeddable_ai_page":
          if (window.theia_frame) {
            let mess = {
              type: "open_embeddable_ai_page",
              tool: event.data.tool,
              action: event.data.action
            }
            window.theia_frame.postMessage(mess, window.theia_origin);
            console.log("sent the request to open a embeddable_ai page to the theia_iframe");
          }
          break;
      }
    }
  });
}

// run once; starts listening to a request from theia when theia is loaded
function listenToTheiaLoad() {
  console.log("adding message event listener for indication from THEIA when it's loaded")
  let listenerFunction = (event) => {
    if (event.origin != window.theia_origin) return
    if (event && event.data) {
      const type = event.data.type;
      switch (type) {
        case "frame_loaded":
          console.log("received message from theia indicating that theia has loaded")
          if (window.theia_frame) {
            //sending message to theia to upload its theme to the curent UI's theme
            window.theia_frame.postMessage({ type: "update_theme", color: localStorage.getItem("theme") }, window.theia_origin);
            window.removeEventListener('message', listenerFunction)
          };
          break;
      }
    }
  }

  window.addEventListener('message', listenerFunction)
}


// run once; starts listening to a request from author-ide when author-ide is loaded
function listenToAuthorIDELoad() {
  console.log("adding message event listener for indication from AUTHOR_IDE when it's loaded");
  let listenerFunction = (event) => {
    if (event.origin != window.author_ide_origin) return
    if (event && event.data) {
      const type = event.data.type;
      if (window.author_ide_frame) {
        //sending message to AUTHOR_IDE to upload its theme to the curent UI's theme
        window.author_ide_frame.postMessage({ type: "update_theme", color: localStorage.getItem("theme") }, window.author_ide_origin);
        window.removeEventListener('message', listenerFunction)
      };
      switch (type) {
        case "frame_loaded":
          console.log("received message from AUTHOR_IDE indicating that AUTHOR_IDE has loaded")
          if (window.author_ide_frame) {
            //sending message to AUTHOR_IDE to upload its theme to the curent UI's theme
            window.author_ide_frame.postMessage({ type: "update_theme", color: localStorage.getItem("theme") }, window.author_ide_origin);
            window.removeEventListener('message', listenerFunction)
          };
          break;
      }
    }
  };

  window.addEventListener('message', listenerFunction)
}

// once the page is loaded, start listening to requests from theia and author_ide
window.addEventListener('load', () => {
  setFramesOrigin(window.data.author_ide_url, window.data.iframe_src);

  window.theia_frame = window.frames.tool_iframe_name;
  listenToTheiaLoad();

  if (window.data.author_ide_url !== undefined) {
    window.author_ide_frame = window.frames.author_ide_iframe_name;
    listenToAuthorIDELoad();
  }

  commsBetweenIframes();
});