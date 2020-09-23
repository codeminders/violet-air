$(() => {
    $('#footer').on('click', 'button', function(e) {
        console.log($(this).text());
        assistantCanvas.closeMic();
        assistantCanvas.sendTextQuery($(this).text(), $(this).text());
        e.stopPropagation();
    });

    const callbacks = {
        onUpdate: (data) => {
            console.log(data);

            if (data.screen == 'stats') {
                $('#value').show().text(data.value);
                $('#label').show().text(data.title);
                let classes = data.level;
                if (data.background_index) {
                    classes += ' ' + data.level + '-' + data.background_index;
                }
                if (!data.backgrounds) {
                    classes += ' no-backgrounds';
                }
                $(document.body).removeClass().addClass(classes);
            } else {
                $('#value,#label').hide();
                $(document.body).removeClass().addClass('fallback');
            }
            if (data.chips && data.chips.length) {
                $('#footer').show();
                const buttons = $('.buttons').empty();
                data.chips.forEach((c) => {
                    const label = typeof c === 'string' ? c : c.text;
                    const className = typeof c === 'string' ? '' : c.classname;
                    const button = $('<button/>').addClass(className).
                    append($('<div/>', { class: 'icon' }).text(label));
                    buttons.append(button);
                });

            } else {
                $('#footer').hide();
            }
        },
    };
    window.interactiveCanvas.ready(callbacks);
});