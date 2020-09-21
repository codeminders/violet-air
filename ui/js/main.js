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
                $(document.body).removeClass().addClass(data.level + (data.backgrounds ? '' : ' no-backgrounds'));
            } else {
                $('#value,#label').hide();
                $(document.body).removeClass();
            }
            if (data.chips && data.chips.length) {
                $('#footer').show();
                const buttons = $('.buttons').empty();
                data.chips.forEach((c) => {
                    const button = $('<button/>').text(c);
                    buttons.append(button);
                });

            } else {
                $('#footer').hide();
            }
        },
    };
    window.interactiveCanvas.ready(callbacks);
});