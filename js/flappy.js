function novoElement(tagName, className) {
    const elem = document.createElement(tagName);
    elem.className = className;
    return elem;
}

function Barreira (reversa = false) {
    this.element = novoElement('div', 'barreira');

    const borda = novoElement('div', 'borda');
    const corpo = novoElement('div', 'corpo');
    this.element.appendChild(reversa ? corpo : borda);
    this.element.appendChild(reversa ? borda : corpo);
    
    this.setAltura = altura => corpo.style.height = `${altura}px`;
}

function parDeBarreiras (altura, abertura, x) {
    this.element = novoElement('div', 'par-de-barreiras');

    this.superior = new Barreira(true);
    this.inferior = new Barreira(false);

    this.element.appendChild(this.superior.element);
    this.element.appendChild(this.inferior.element);

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura);
        const alturaInferior = altura - abertura - alturaSuperior;
        this.superior.setAltura(alturaSuperior);
        this.inferior.setAltura(alturaInferior);
    }

    this.getX = () => parseInt(this.element.style.left.split('px')[0]);
    this.setX = x => this.element.style.left = `${x}px`;
    this.getLargura = () => this.element.clientWidth

    this.sortearAbertura();
    this.setX(x);
}

// const b = new parDeBarreiras(700, 200, 400);
// document.querySelector('[wm-flappy]').appendChild(b.element);

function Barreiras (altura, largura, abertura, espaco, notificarPonto) {
    this.pares = [
        new parDeBarreiras(altura, abertura, largura),
        new parDeBarreiras(altura, abertura, largura + espaco),
        new parDeBarreiras(altura, abertura, largura + espaco*2),
        new parDeBarreiras(altura, abertura, largura + espaco*3)
    ]

    const deslocamento = 3;
    this.animar = () => {
        this.pares.forEach(par =>{
            par.setX(par.getX() - deslocamento);

            if (par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espaco * this.pares.length);
                par.sortearAbertura();
            }

            const meio = largura /2;
            const cruzouMeio = par.getX() + deslocamento >= meio
            && par.getX() < meio;
            if(cruzouMeio) notificarPonto();
        });   
    }
}

function Passaro (alturajogo) {
    let voando = false;

    this.element = novoElement('img', 'passaro');
    this.element.src = 'imgs/passaro.png';

    this.getY = () => parseInt(this.element.style.bottom.split('px')[0]);
    this.setY = y => this.element.style.bottom = `${y}px`;

    window.onkeydown = e => voando = true;
    window.onkeyup = e => voando = false;

    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -5);
        const alturaMaxima = alturajogo - this.element.clientWidth;

        if(novoY <= 0){
            this.setY(0);
        }else if(novoY >= alturaMaxima) {
            this.setY(alturaMaxima);
        }else{
            this.setY(novoY);
        }
    }
    this.setY(alturajogo / 2);
}


function Progresso() {
    this.element = novoElement('span', 'progresso');
    this.atualizarPontos = pontos => {
        this.element.innerHTML = pontos
    }

    this.atualizarPontos(0);
}
function estaoSobrepostos(elementA, elementB){
    const a = elementA.getBoundingClientRect();
    const b = elementB.getBoundingClientRect();

    const horizontal = a.left + a.width >= b.left
    && b.left + b.width >= a.left;
    const vertical = a.top + a.height >= b.top
    && b.top + b.height >= a.top;
    return horizontal && vertical;
}

function colidiu(passaro, barreiras) {
    let colidiu = false;
    barreiras.pares.forEach(parDeBarreiras => {
        if (!colidiu) {
            const superior = parDeBarreiras.superior.element;
            const inferior = parDeBarreiras.inferior.element;
            colidiu = estaoSobrepostos(passaro.element, superior)
            || estaoSobrepostos(passaro.element, inferior.element);
        }
    });

    return colidiu;
}

function FlappyBird() {
    let pontos = 0;

    const areaDoJogo = document.querySelector('[wm-flappy]');
    const altura = areaDoJogo.clientHeight;
    const largura = areaDoJogo.clientHeight;

    const progresso = new Progresso();
    const barreiras = new Barreiras(altura, largura, 200, 400, 
        () => progresso.atualizarPontos(++pontos));
    const passaro = new Passaro(altura);
    
    areaDoJogo.appendChild(progresso.element);
    areaDoJogo.appendChild(passaro.element);
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.element));

    this.start = () => {

        const temporizador = setInterval(() => {
            barreiras.animar();
            passaro.animar();

            if(colidiu(passaro, barreiras)){
                clearInterval(temporizador);
            }
        },20);
    }
}
new FlappyBird().start();