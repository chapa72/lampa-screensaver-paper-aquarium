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

        const promptText = 'Paper Aquarium\nВведите ID аквариума после /t/ (например: c5ughmbhfa)'
        const answer = typeof window.prompt === 'function' ? window.prompt(promptText, current || 'c5ughmbhfa') : null

        if (answer === null) return current || ''

        const cleaned = sanitizeTankId(answer)

        if (!cleaned) {
            if (typeof window.alert === 'function') {
                window.alert('Неверный ID аквариума. Нужен номер после /t/, например: c5ughmbhfa')
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
                }

                create() {
                    const tankId = sanitizeTankId(this.params.id || getTankId() || '')
                    const finalTankId = tankId || askTankId(true)
                    const url = 'https://aquarium.mrmot9i.com/t/' + encodeURIComponent(finalTankId) + '?demo'

                    this.html = $('<div class="screensaver-paper-aquarium"><iframe src="' + url + '" allowfullscreen></iframe></div>')
                }

                render() {
                    return this.html
                }

                destroy() {
                    if (this.html) {
                        this.html.remove()
                    }
                }
            }

            L.Screensaver.class_list[SCREEN_TYPE] = PaperAquariumScreensaver
        }
    }

    install()
})()
