(function () {
    if (window.__lampa_paper_aquarium_installed) return
    window.__lampa_paper_aquarium_installed = true

    const STORAGE_KEY = 'paper_aquarium_tank_id'
    const SCREEN_TYPE = 'paper-aquarium'
    const STYLE_ID = 'paper-aquarium-screensaver-style'

    function sanitizeTankId(value) {
        if (value === null || value === undefined) return ''

        let text = String(value).trim()

        if (!text) return ''

        text = text.replace(/^https?:\/\/[^/]+\/t\//i, '')
        text = text.replace(/^.*\/t\//i, '')
        text = text.replace(/[?#].*$/, '')
        text = text.replace(/^\/+|\/+$/g, '')
        text = text.replace(/[^a-zA-Z0-9_-]/g, '')

        return text
    }

    function getTankId() {
        try {
            if (!window.localStorage) return ''
            return sanitizeTankId(window.localStorage.getItem(STORAGE_KEY) || '')
        }
        catch (e) {
            return ''
        }
    }

    function saveTankId(value) {
        try {
            if (!window.localStorage) return false

            const clean = sanitizeTankId(value)

            if (!clean) return false

            window.localStorage.setItem(STORAGE_KEY, clean)

            return clean
        }
        catch (e) {
            return false
        }
    }

    function askTankId(force) {
        const current = getTankId()

        if (!force && current) return current

        const promptText = 'Paper Aquarium\nведите ID аквариума после /t/ (например: c5ughmbhfa)'
        const answer = typeof window.prompt === 'function' ? window.prompt(promptText, current || 'c5ughmbhfa') : null

        if (answer === null) return current || ''

        const cleaned = sanitizeTankId(answer)

        if (!cleaned) {
            if (typeof window.alert === 'function') {
                window.alert('еверный ID аквариума. ужен номер после /t/, например: c5ughmbhfa')
            }
            return askTankId(true)
        }

        saveTankId(cleaned)

        return cleaned
    }

    function addStyles() {
        if (document.getElementById(STYLE_ID)) return

        const style = document.createElement('style')
        style.id = STYLE_ID
        style.textContent = `
            .screensaver-paper-aquarium {
                position: fixed !important;
                inset: 0;
                width: 100%;
                height: 100%;
                background: #000;
                overflow: hidden;
                z-index: 10000;
            }

            .screensaver-paper-aquarium iframe,
            .screensaver-paper-aquarium .screensaver-paper-aquarium__video {
                position: fixed;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                border: 0;
                background: #000;
                z-index: 0;
            }

            .screensaver-paper-aquarium__gradient {
                position: fixed;
                left: 0;
                bottom: 0;
                width: 100%;
                height: 45%;
                background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 1%, rgba(0,0,0,.75) 100%);
                z-index: 2;
                pointer-events: none;
            }

            .screensaver-paper-aquarium__datetime {
                position: fixed;
                right: 5%;
                bottom: 10%;
                width: 50%;
                z-index: 3;
                pointer-events: none;
                color: rgba(255,255,255,.9);
                text-align: right;
                text-shadow: 2px 2px 2px rgba(0,0,0,.9);
                opacity: 0.5;
            }

            .screensaver-paper-aquarium__datetime-time {
                font-size: 3em;
                font-weight: 300;
                line-height: 1;
                margin-bottom: .25em;
            }

            .screensaver-paper-aquarium__datetime-date {
                font-size: 1.5em;
                font-weight: 300;
                line-height: 1.2;
            }

            .screensaver-paper-aquarium .time--clock,
            .screensaver-paper-aquarium .time--full {
                display: inline-block;
            }
        `

        document.head.appendChild(style)
    }

    function install() {
        const L = window.Lampa

        if (!L || !L.Screensaver || !L.Params || !L.Storage) {
            setTimeout(install, 250)
            return
        }

        addStyles()

        const currentTypes = L.Params.values && L.Params.values.screensaver_type ? L.Params.values.screensaver_type : {}
        if (!currentTypes[SCREEN_TYPE]) currentTypes[SCREEN_TYPE] = 'Paper Aquarium'
        L.Params.values.screensaver_type = currentTypes

        if (!L.Screensaver.class_list) L.Screensaver.class_list = {}

        if (!L.Screensaver.class_list[SCREEN_TYPE]) {
            class PaperAquariumScreensaver {
                constructor(params) {
                    this.params = params || {}
                    this.html = null
                    this.clock = null
                }

                create() {
                    const tankId = sanitizeTankId(this.params.id || getTankId() || '')
                    const finalTankId = tankId || askTankId(true)
                    const url = 'https://aquarium.mrmot9i.com/t/' + encodeURIComponent(finalTankId) + '?tv'

                    this.html = $(`
                        <div class="screensaver-paper-aquarium">
                            <iframe class="screensaver-paper-aquarium__video" src="${url}" allowfullscreen></iframe>
                            <div class="screensaver-paper-aquarium__gradient"></div>
                            <div class="screensaver-paper-aquarium__datetime">
                                <div class="screensaver-paper-aquarium__datetime-time">
                                    <span class="time--clock"></span>
                                </div>
                                <div class="screensaver-paper-aquarium__datetime-date">
                                    <span class="time--full"></span>
                                </div>
                            </div>
                        </div>
                    `)

                    if (L.Utils && L.Utils.time) {
                        this.clock = L.Utils.time(this.html[0])
                        if (this.clock && this.clock.tik) this.clock.tik()
                    }
                }

                render() {
                    return this.html
                }

                destroy() {
                    if (this.clock && this.clock.destroy) this.clock.destroy()
                    if (this.html) this.html.remove()
                }
            }

            L.Screensaver.class_list[SCREEN_TYPE] = PaperAquariumScreensaver
        }
    }

    install()
})()
