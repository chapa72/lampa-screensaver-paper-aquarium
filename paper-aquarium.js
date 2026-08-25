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
                position: absolute !important;
                inset: 0;
                width: 100%;
                height: 100%;
                background: radial-gradient(circle at top, #0d2d3c 0%, #06141d 45%, #020d13 100%);
                overflow: hidden;
                z-index: 9999;
            }

            .screensaver-paper-aquarium iframe {
                position: absolute;
                inset: 0;
                width: 100%;
                height: 100%;
                border: 0;
                background: transparent;
            }

            .screensaver-paper-aquarium__overlay {
                position: absolute;
                inset: 0;
                z-index: 1;
                pointer-events: none;
                background: linear-gradient(to top, rgba(0,0,0,.28), rgba(0,0,0,0) 28%, rgba(0,0,0,.18) 100%);
            }

            .screensaver-paper-aquarium__datetime {
                position: absolute;
                right: 4.5vh;
                bottom: 4vh;
                z-index: 2;
                pointer-events: none;
                color: rgba(255,255,255,.95);
                text-align: right;
                text-shadow: 0 3px 12px rgba(0,0,0,.45);
            }

            .screensaver-paper-aquarium__datetime-time {
                font-size: clamp(28px, 3vw, 90px);
                line-height: .9;
                font-weight: 700;
                letter-spacing: .04em;
            }

            .screensaver-paper-aquarium__datetime-date {
                margin-top: .3vh;
                font-size: clamp(11px, 1.1vw, 24px);
                line-height: 1.2;
                opacity: .9;
                letter-spacing: .14em;
                text-transform: uppercase;
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
                            <div class="screensaver-paper-aquarium__overlay"></div>
                            <iframe src="${url}" allowfullscreen></iframe>
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
