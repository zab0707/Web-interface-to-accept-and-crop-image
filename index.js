const cropper = document.getElementById("cropper");
const container = document.getElementById("container");
const c = document.getElementById("inCanvas");

let mouseMove = false, mouseDown = false, isReszing = false;


dragCropper(cropper);

function dragCropper(ele){
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    ele.onmousedown = dragMouseDown;
    function dragMouseDown(e){
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        container.onmouseup = closeDrag;
        container.onmousemove = eleDrag;
    }
    
    function eleDrag(e){
        if(isReszing){
            return;
        }
        if(mouseMove && mouseDown){
            e.preventDefault();
            let containerArea = container.getBoundingClientRect();
            let cropperArea = cropper.getBoundingClientRect();

            if(cropperArea.left >= containerArea.left){
                if(cropperArea.right <= containerArea.right){
                    pos1 = pos3 - e.clientX;
                }
                else{
                    pos1 = containerArea.right - pos3;
                }   
            }
            else{
                pos1 = containerArea.left - pos3;
            }
            if(cropperArea.top >= containerArea.top){
                if(cropperArea.bottom <= containerArea.bottom){
                    pos2 = pos4 - e.clientY;
                }
                else{
                    pos2 = containerArea.bottom - pos4;
                }
                
            }
            else{
                pos2 = containerArea.top - pos4;
            }
            cropper.style.left = (cropper.offsetLeft - pos1) + "px";
            cropper.style.top = (cropper.offsetTop - pos2) + "px";

            pos3 = e.clientX;
            pos4 = e.clientY;
        }
    }

    function closeDrag(e){
        container.onmouseup = null;
        container.onmousemove = null;
    }
}	

function mouseMove_on(e){
    mouseMove = true;
}
    
function mouseMove_off(e){
    mouseMove = false;
}
    
function mouseDown_on(e){
    mouseDown = true;
}
function mouseDown_off(e){
    mouseDown = false;
}


const resizers = document.querySelectorAll(".resizer");
let currentResizer;

for(let resizer of resizers){
    resizer.addEventListener("mousedown", mousedown);

    function mousedown(e){
        currentResizer = e.target;
        isReszing = true;

        let prevX = e.clientX;
        let prevY = e.clientY;

        container.addEventListener("mousemove", mousemove);
        container.addEventListener("mouseup", mouseup);

        function mousemove(e){
            const rect = cropper.getBoundingClientRect();
            if(currentResizer.classList.contains('se')){
                cropper.style.width = rect.width - (prevX - e.clientX) + "px";
                cropper.style.height = rect.height - (prevY - e.clientY) + "px";
            }
            else if (currentResizer.classList.contains("sw")) {
                cropper.style.width = rect.width + (prevX - e.clientX) + "px";
                cropper.style.height = rect.height - (prevY - e.clientY) + "px";
                cropper.style.left = rect.left - (prevX - e.clientX) + "px";
            } else if (currentResizer.classList.contains("ne")) {
                cropper.style.width = rect.width - (prevX - e.clientX) + "px";
                cropper.style.height = rect.height + (prevY - e.clientY) + "px";
                cropper.style.top = rect.top - (prevY - e.clientY) + "px";
            } else {
                cropper.style.width = rect.width + (prevX - e.clientX) + "px";
                cropper.style.height = rect.height + (prevY - e.clientY) + "px";
                cropper.style.top = rect.top - (prevY - e.clientY) + "px";
                cropper.style.left = rect.left - (prevX - e.clientX) + "px";
            }
            prevX = e.clientX;
            prevY = e.clientY;
            
        }

        function mouseup(){
            container.removeEventListener("mousemove", mousemove);
            container.removeEventListener("mouseup", mouseup);
            isReszing = false;
        }
    }
}


document.getElementById("image").addEventListener("change", () => {
    const c = document.getElementById("inCanvas");
    const ctx = c.getContext("2d");
    const image = document.getElementById("image");
    if(!image.files || !image.files[0]) return;
    const fr = new FileReader();
    fr.addEventListener("load", (e) => {
        const img = new Image();
        img.addEventListener("load", () => {
            c.width = 500;
            c.height = 500;
            ctx.drawImage(img, 0, 0);
            container.style.width = img.width + 20 + "px";
            container.style.height = img.height + "px";
            document.getElementById("modify").removeAttribute("hidden");
        });
        img.src = e.target.result;
    });
    fr.readAsDataURL(image.files[0]);
});


document.getElementById("crop").addEventListener("click", () => {
    const containerArea = container.getBoundingClientRect();
    const ne = document.getElementById("ne").getBoundingClientRect();
    const nw = document.getElementById("nw").getBoundingClientRect();
    const se = document.getElementById("se").getBoundingClientRect();
    const sw = document.getElementById("sw").getBoundingClientRect();
    const firstpoint = [((nw.x - containerArea.left) + 1), ((nw.y - containerArea.top) + 1)];
    const secondpoint  = [((ne.x - containerArea.left) + 5), ((ne.y - containerArea.top) + 1)];
    const thirdpoint  = [((sw.x - containerArea.left) + 1), ((sw.y - containerArea.top) + 5)];
    const fourthpoint = [((se.x - containerArea.left) + 5), ((se.y - containerArea.top) + 5)];
    let src = cv.imread('inCanvas');
    let dst = new cv.Mat();
    let dsize = new cv.Size(src.rows, src.cols);
    let srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [firstpoint[0], firstpoint[1], secondpoint[0], secondpoint[1], thirdpoint[0], thirdpoint[1], fourthpoint[0], fourthpoint[1]]);
    let dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, containerArea.width, 0, 0, containerArea.height, containerArea.width, containerArea.height]);
    let M = cv.getPerspectiveTransform(srcTri, dstTri);
    cv.warpPerspective(src, dst, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());
    cv.imshow('outCanvas', dst);
    src.delete(); dst.delete(); M.delete(); srcTri.delete(); dstTri.delete();
    document.getElementById("out").removeAttribute("hidden");
   
});

document.getElementById("download").addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = `${document.getElementById("image").files[0].name.split(".")[0]}-modified.png`;
    link.href = document.getElementById("outCanvas").toDataURL("image/png");
    link.click();
});