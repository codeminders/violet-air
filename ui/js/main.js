window.addEventListener('load', () => {
    const callbacks = {
        onUpdate: (data) => {
            console.log(data);
            document.getElementById('value').innerHTML = data.value;
            document.getElementById('label').innerHTML = data.label;
            document.body.style.backgroundColor = data.color;
        },
    };
    window.interactiveCanvas.ready(callbacks);
});