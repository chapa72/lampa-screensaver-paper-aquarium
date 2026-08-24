(function () {
    'use strict';

    Lampa.Plugins.add('aquarium_screensaver', function () {
        var aquariumUrl = 'https://aquarium.mrmot9i.com/t/c5ughmbhfa?demo';

        // Переопределяем встроенный модуль Screensaver
        Lampa.Screensaver.show = function () {
            if (this.active) return;
            this.active = true;

            // Создаем полноэкранный контейнер с iframe
            var html = $(`
                <div class="aquarium-screensaver" style="
                    position: fixed; 
                    top: 0; 
                    left: 0; 
                    width: 100vw; 
                    height: 100vh; 
                    z-index: 99999; 
                    background: #000;
                    pointer-events: none;
                ">
                    <iframe src="${aquariumUrl}" style="
                        width: 100%; 
                        height: 100%; 
                        border: none;
                    "></iframe>
                </div>
            `);

            $('body').append(html);
            this.element = html;

            // Обработчик нажатия любой клавиши пульта/клавиатуры для выхода из заставки
            this.listener = function () {
                Lampa.Screensaver.hide();
            };

            Lampa.Controller.add('aquarium_screensaver', {
                toggle: function () {},
                left: this.listener,
                right: this.listener,
                up: this.listener,
                down: this.listener,
                enter: this.listener,
                back: this.listener
            });

            Lampa.Controller.toggle('aquarium_screensaver');
        };

        Lampa.Screensaver.hide = function () {
            if (!this.active) return;
            this.active = false;

            if (this.element) {
                this.element.remove();
                this.element = null;
            }

            // Возвращаем фокус ввода на предыдущий контроллер Lampa
            Lampa.Controller.toggle('content');
        };
    });
})();
