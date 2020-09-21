window.addEventListener('load', () => {
    const callbacks = {
        onUpdate: (data) => {
            console.log(data);
            document.getElementById('value').innerHTML = data.value;
            document.getElementById('label').innerHTML = data.title;
            document.body.className = data.level + (data.backgrounds ? '' : ' no-backgrounds');
        },
    };
    window.interactiveCanvas.ready(callbacks);
});