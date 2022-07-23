let addBtn = document.querySelector(".add-btn");
let removeBtn = document.querySelector(".remove-btn");

let modalCont = document.querySelector(".modal-cont");
let textarea = document.querySelector(".textarea");

let modalVisible = true;
let removeFlag = false;

let mainCont = document.querySelector(".main-cont");

let lockClass = "fa-lock";
let openlockClass = "fa-lock-open";

let allColors = ["blue", "red", "purple", "black"];
let defaultModalColor = allColors[allColors.length - 1];

let ticketArr=[];

if(localStorage.getItem("jira_ticket")) {
    ticketArr = JSON.parse(localStorage.getItem("jira_ticket"));
    ticketArr.forEach((tickObj)=> {
        createTicket(tickObj.tktColor,tickObj.tktTask,tickObj.tktID);
    });
}

//toolbox color filtering
let toolboxColors = document.querySelectorAll(".color");
toolboxColors.forEach((color)=> {
    color.addEventListener("click",(e)=> {
        let ticketCont=document.querySelectorAll(".ticket-cont");
        let selectedColor = color.classList[0];
        ticketCont.forEach((ticket)=> {
            let ticketColor = ticket.querySelector(".ticket-color");
            ticketColor=ticketColor.classList[1];
            if(ticketColor!==selectedColor) {
                ticket.style.display="none";
            }
            else {
                ticket.style.display="block";
            }
        });
    });
    color.addEventListener("dblclick",(e)=> {
        let ticketCont=document.querySelectorAll(".ticket-cont");
        ticketCont.forEach((ticket)=> {
            ticket.style.display="block";
        });
    });
});

// modal priority color selection
let allpriorityColors = document.querySelectorAll(".priority-color");
allpriorityColors.forEach((colorEle) => {
    colorEle.addEventListener("click", (e) => {
        allpriorityColors.forEach((color) => {
            color.classList.remove("default-color");
        });
        colorEle.classList.add("default-color");

        defaultModalColor = colorEle.classList[0];
    });
});

//modal diplay toggle
addBtn.addEventListener("click", function (e) {
    let ticketCont=document.querySelectorAll(".ticket-cont");
    if (modalVisible) {
        addBtn.classList.add("selected");
        modalCont.style.display = "flex";
        
        allpriorityColors.forEach((color) => {
            color.classList.remove("default-color");
        });
        let defColor = document.querySelectorAll(".priority-color")[3];
        defColor.classList.add("default-color");
        defaultModalColor=allColors[allColors.length - 1];

        ticketCont.forEach((ticket)=> {
            ticket.style.display="none";
        });
    }
    else {
        addBtn.classList.remove("selected");
        modalCont.style.display = "none";

        ticketCont.forEach((ticket)=> {
            ticket.style.display="block";
        });
    }
    modalVisible = !modalVisible;
});
//remove btn toogle 
let allTickets = document.querySelectorAll(".ticket-cont");
removeBtn.addEventListener("click", (e) => {
    removeFlag = !removeFlag;
    if (removeFlag) {
        removeBtn.classList.add("selected");
    }
    else {
        removeBtn.classList.remove("selected");
    }
});

//modal saving as ticket
modalCont.addEventListener("keydown", (e) => {
    let key = e.key;
    let ticketCont=document.querySelectorAll(".ticket-cont");
    if (key == 'Shift') {
        createTicket(defaultModalColor, textarea.value, shortid());
        addBtn.classList.remove("selected");
        modalCont.style.display = "none";
        modalVisible = !modalVisible;
        textarea.value = "";

        ticketCont.forEach((ticket)=> {
            ticket.style.display="block";
        });
    }
});

// ticket creation
function createTicket(tktColor, tktTask, tktID) {
    let ticketCont = document.createElement("div");
    ticketCont.setAttribute("class", "ticket-cont");
    ticketCont.innerHTML =
        `
        <div class="ticket-color ${tktColor}"></div>
        <div class="ticket-id">#${tktID}</div>
        <div class="ticket-task">${tktTask}</div>
        <div class="ticket-lock"><i class="fa-solid fa-lock"></i></div>
    `;
    mainCont.appendChild(ticketCont);

    let ticketIdx=getTicketIdx(tktID);
    console.log(ticketIdx);
    if(ticketIdx<0) {
        ticketArr.push({tktColor,tktID,tktTask});
        localStorage.setItem("jira_ticket",JSON.stringify(ticketArr));
    }
    handleRemoval(ticketCont,tktID);
    handleLock(ticketCont,tktID);
    handleColor(ticketCont,tktID);
}

// ticket removing
function handleRemoval(ticket, id) {
    ticket.addEventListener("click",(e)=> {
        if(!removeFlag) return;
        let ticketIdx=getTicketIdx(id);
        ticketArr.splice(ticketIdx,1);
        localStorage.setItem("jira_ticket",JSON.stringify(ticketArr));

        ticket.remove();
    });
}

// function removeTicket() {
//     let allTickets = document.querySelectorAll(".ticket-cont");
//     if(removeFlag) {
//         alert("hi");
//         allTickets.forEach((ticket)=> {
//             ticket.addEventListener("click",(e)=>{
//                 ticket.style.display="none";
//             });
//         });
//     }
// }

//ticket lock functionality
function handleLock(ticket,id) {
    let taskArea = ticket.querySelector(".ticket-task");
    let lockEle = ticket.querySelector(".ticket-lock");
    lockEle = lockEle.children[0];
    lockEle.addEventListener("click",(e)=> {
        if(lockEle.classList.contains(lockClass)) {
            lockEle.classList.remove(lockClass);
            lockEle.classList.add(openlockClass);

            taskArea.setAttribute("contenteditable","true");
            taskArea.setAttribute("spellcheck","false");
        }
        else {
            lockEle.classList.add(lockClass);
            lockEle.classList.remove(openlockClass);
            taskArea.setAttribute("contenteditable","false");
        }

        //modify data in local storage (ticket-task)
        let ticketIdx=getTicketIdx(id);
        ticketArr[ticketIdx].tktTask = taskArea.innerText;
        localStorage.setItem("jira_ticket",JSON.stringify(ticketArr));
    });
}

//ticket color changing
function handleColor(ticket,tktID) {
    let ticketColor=ticket.querySelector(".ticket-color");

    // ticket idx from ticketArr
    ticketColor.addEventListener("click",(e)=> {
        
        let currColor = ticketColor.classList[1];
        let currColorIdx=allColors.findIndex((color)=> {
            return currColor===color;
        });
        
        let nextColorIdx = (currColorIdx+1)%allColors.length;
        let nextColor = allColors[nextColorIdx];
        ticketColor.classList.remove(currColor);
        ticketColor.classList.add(nextColor);
        
        // modify data in local storage (color)
        let ticketIdx=getTicketIdx(tktID);
        ticketArr[ticketIdx].tktColor=nextColor;
        localStorage.setItem("jira_ticket",JSON.stringify(ticketArr));
    });

}

function getTicketIdx(id) {
    let ticketIdx= ticketArr.findIndex((ticketObj)=> {
        return ticketObj.tktID===id;
    });
    return ticketIdx;
}