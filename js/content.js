let home_speed = 100;
let local_speed = 100;
let social_speed = 100;
let global_speed = 100;

const sleep = waitTime => new Promise( resolve => setTimeout(resolve, waitTime) );

const deck_observers = [];
let others_observer = [];

const action_for_deck = (column) => {
    const header = column.getElementsByTagName("header")[0];
    const icon = header.querySelector("i.ti");
    const class_name = icon.className;

    const scrollable_column = column.querySelector("div.xubeM")
    const column_height = scrollable_column.clientHeight * 1.2 + Math.abs(scrollable_column.scrollTop);

    if (class_name.includes("ti-home")) adjust_speed(scrollable_column, column_height, home_speed, "home");
    else if (class_name.includes("ti-planet")) adjust_speed(scrollable_column, column_height, local_speed, "local");
    else if (class_name.includes("ti-rocket")) adjust_speed(scrollable_column, column_height, social_speed, "social");
    else if (class_name.includes("ti-whirl")) adjust_speed(scrollable_column, column_height, global_speed, "global");
};

const action_for_others = (column, icon) => {
    const column_height = window.innerHeight * 1.2 + window.scrollY;

    if (icon.className.includes("ti-home")) adjust_speed(column, column_height, home_speed, "home");
    else if (icon.className.includes("ti-planet")) adjust_speed(column, column_height, local_speed, "local");
    else if (icon.className.includes("ti-rocket")) adjust_speed(column, column_height, social_speed, "social");
    else if (icon.className.includes("ti-whirl")) adjust_speed(column, column_height, global_speed, "global");
};

const id_to_style = {
    "home": {},
    "local": {},
    "social": {},
    "global": {},
};

const get_note_id = (note) => {
    const RN_header = note.querySelector("div.xBwhh");

    if (RN_header == null) {
        const timestamp = note.querySelector("div.xAtlm");
        const note_url = timestamp.querySelector("a").href.split('/');
        return note_url[note_url.length - 1];
    }
    else {
        const user_href = RN_header.querySelector("span.xzyAJ > a").href.split('/');
        const time = RN_header.querySelector("time").title;
        return "RN: " + user_href[user_href.length - 1] + ": " + time;
    }
};

const adjust_speed = (column, column_height, speed, name) => {
    if (speed == 100) return;

    const notes = column.querySelectorAll("div.xcSej.x3762");

    if (speed == 0) {
        Array.from(notes).forEach((note) => {
            note.style.visibility = "hidden";
        });
        return;
    }

    const notes_height = (notes) => Array.from(notes).map((note) => note.offsetHeight).reduce((sum, element) => sum + element, 0);

    const now = Date.now();
    let continuous = 0;

    Array.from(notes).reverse().forEach((note) => {
        const note_id = get_note_id(note);

        if (Object.keys(id_to_style[name]).includes(note_id)) {
            if (id_to_style[name][note_id].style) {
                note.style.display = "none";
                continuous += (100 - (speed + continuous)) / 3;
            }
            else continuous = 0;
        }
        else if (notes_height(notes) - note.offsetHeight > column_height) {
            const visibility = Math.random() * 100 >= speed + continuous;
            id_to_style[name][note_id] = {
                style: visibility,
                datetime: now
            };

            if (visibility) {
                note.style.display = "none";
                continuous += (100 - (speed + continuous)) / 3;
            }
            else continuous = 0;
        }
        else {
            id_to_style[name][note_id] = {
                style: false,
                datetime: now
            };
        }
    });

    Object.keys(id_to_style[name]).forEach((note_id) => {
        if (now - id_to_style[name][note_id].datetime > 10 * 60 * 1000) delete id_to_style[name][note_id];
    });
};

const check_storage = () => {
    browser.storage.sync.get(["home", "local", "social", "global"], (items) => {
        const cached_home_speed = items.home;
        if (cached_home_speed != undefined) {
            home_speed = parseInt(cached_home_speed);
        }
        const cached_local_speed = items.local;
        if (cached_local_speed != undefined) {
            local_speed = parseInt(cached_local_speed);
        }
        const cached_social_speed = items.social;
        if (cached_social_speed != undefined) {
            social_speed = parseInt(cached_social_speed);
        }
        const cached_global_speed = items.global;
        if (cached_global_speed != undefined) {
            global_speed = parseInt(cached_global_speed);
        }
    });
};

const update = () => {
    const columns = Array.from(document.querySelectorAll("section.xnksy.xeiRC.xa96n"));
    if (columns.length > 0) columns.map(action_for_deck);
};

window.addEventListener("load", async () => {
    let sections = document.querySelectorAll("section.xnksy.xeiRC.xa96n");
    let header = document.querySelector("div.x5vNM");

    while (sections.length == 0 && header == null) {
        await sleep(2000).then(() => {
            sections = document.querySelectorAll("section.xnksy.xeiRC.xa96n");
            header = document.querySelector("div.x5vNM");
        });
    }

    const UI = (sections.length != 0) ? "deck" : "others";
    console.log("UI: " + UI);

    const config = { childList: true, subtree: true };

    if (UI == "deck") {
        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];

            const child_header = section.querySelector("div.xeHR5.xxPg1.xkPjN");
            if (child_header != null) {
                const buttons = child_header.getElementsByTagName("button");

                for (let i = 0; i < buttons.length; i++) {
                    const button = buttons[i];

                    button.addEventListener("click", async () => {
                        const column_name = button.querySelector("div.xqAei").textContent;
                        console.log(column_name);
                        const icon = button.querySelector("i.ti");
                        let column = section.querySelector("div.xfKPa.xf9zr.xBIqc.xqbRq");
                        while (column == null) {
                            await sleep(2000);
                            column = section.querySelector("div.xfKPa.xf9zr.xBIqc.xqbRq");
                        }
                        const observer = new MutationObserver((mutationsList, observer) => {
                            for (const mutation of mutationsList) {
                                if (mutation.type === "childList") {
                                    action_for_others(section, icon);
                                }
                            }
                        });
                        observer.observe(column, config);
                        others_observer = [observer];

                        console.log("section observers: " + (deck_observers.length + others_observer.length));
                    });
                }

                const selected_button = header.querySelector("button.xj7PE");
                selected_button.click();

                continue;
            }

            const observer = new MutationObserver((mutationsList, observer) => {
                for(const mutation of mutationsList) {
                    if (mutation.type === "childList") {
                        action_for_deck(section);
                        // console.log('A child node has been added or removed.');
                    }
                }
            });

            observer.observe(section, config);
            deck_observers.push(observer);
        }

        console.log("section observers: " + (deck_observers.length + others_observer.length));
    }
    else {
        const buttons = header.getElementsByTagName("button");

        for (let i = 0; i < buttons.length; i++) {
            const button = buttons[i];

            button.addEventListener("click", async () => {
                const column_name = button.querySelector("div.xqAei").textContent;
                console.log(column_name);
                const icon = button.querySelector("i.ti");
                let column = document.querySelector("div.xfKPa.xf9zr.xBIqc.xqbRq");
                while (column == null) {
                    await sleep(2000);
                    column = document.querySelector("div.xfKPa.xf9zr.xBIqc.xqbRq");
                }
                const observer = new MutationObserver((mutationsList, observer) => {
                    for (const mutation of mutationsList) {
                        if (mutation.type === "childList") {
                            action_for_others(column, icon);
                        }
                    }
                });
                observer.observe(column, config);
                others_observer = [observer];

                console.log("section observers: " + (deck_observers.length + others_observer.length));
            });
        }

        const selected_button = header.querySelector("button.xj7PE");
        selected_button.click();
    }

    check_storage();
});
