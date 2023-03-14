const init = async () => {
    const home_speed = document.getElementById("home_speed");
    const local_speed = document.getElementById("local_speed");
    const social_speed = document.getElementById("social_speed");
    const global_speed = document.getElementById("global_speed");

    const save_settings = () => {
        browser.storage.sync.set({
            "home": home_speed.value,
            "local": local_speed.value,
            "social": social_speed.value,
            "global": global_speed.value
        }).then((res) => {
            const result_div = document.getElementById("result");
            result_div.textContent = res;
        }).catch((res) => {
            const result_div = document.getElementById("result");
            result_div.textContent = res;
        });
    };

    const home_label = document.getElementById("home_value");
    home_speed.addEventListener("input", () => {
        home_label.innerText = home_speed.value + "%";
    });
    home_speed.addEventListener("change", save_settings);

    const local_label = document.getElementById("local_value");
    local_speed.addEventListener("input", () => {
        local_label.innerText = local_speed.value + "%";
    });
    local_speed.addEventListener("change", save_settings);

    const social_label = document.getElementById("social_value");
    social_speed.addEventListener("input", () => {
        social_label.innerText = social_speed.value + "%";
    });
    social_speed.addEventListener("change", save_settings);

    const global_label = document.getElementById("global_value");
    global_speed.addEventListener("input", () => {
        global_label.innerText = global_speed.value + "%";
    });
    global_speed.addEventListener("change", save_settings);

    browser.storage.sync.get(["home", "local", "social", "global"], (items) => {
        const cached_home_speed = items.home;
        if (cached_home_speed != undefined) {
            home_speed.value = cached_home_speed;
            home_label.innerText = cached_home_speed + "%";
        }
        const cached_local_speed = items.local;
        if (cached_local_speed != undefined) {
            local_speed.value = cached_local_speed;
            local_label.innerText = cached_local_speed + "%";
        }
        const cached_social_speed = items.social;
        if (cached_social_speed != undefined) {
            social_speed.value = cached_social_speed;
            social_label.innerText = cached_social_speed + "%";
        }
        const cached_global_speed = items.global;
        if (cached_global_speed != undefined) {
            global_speed.value = cached_global_speed;
            global_label.innerText = cached_global_speed + "%";
        }
    });
};

init();