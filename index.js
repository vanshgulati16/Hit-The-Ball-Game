
const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')

canvas.width =innerWidth
canvas.height =innerHeight

const scoreId = document.querySelector('#scoreId')
const startgamebtn = document.querySelector('#StartGameId')
const modalEl = document.querySelector('#modalEl')
const bigScore = document.querySelector('#bigScore')

class Player{
    constructor(x, y, radius, color){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color

    }
    draw(){
        context.beginPath()
        context.arc(this.x, this.y, this.radius, 0 , Math.PI * 2 )
        context.fillStyle = this.color
        context.fill()
    }
}

class Projectile{
    constructor(x,y, radius, color, velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw(){
        context.beginPath()
        context.arc(this.x, this.y, this.radius, 0 , Math.PI * 2 )
        context.fillStyle = this.color
        context.fill()
    }

    update(){
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

class Enemy{
    constructor(x,y, radius, color, velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw(){
        context.beginPath()
        context.arc(this.x, this.y, this.radius, 0 , Math.PI * 2 )
        context.fillStyle = this.color
        context.fill()
    }

    update(){
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}
const friction = 0.99
class Particle{
    constructor(x,y, radius, color, velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }

    draw(){
        context.save()
        context.globalAlpha = this.alpha
        context.beginPath()
        context.arc(this.x, this.y, this.radius, 0 , Math.PI * 2 )
        context.fillStyle = this.color
        context.fill()
        context.restore()
    }

    update(){
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction 
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}

const x = canvas.width / 2
const y = canvas.height / 2
let player = new Player(x, y, 10, 'white')

let projectiles = []
let enemies = []
let particles = []

function init(){
    player = new Player(x, y, 10, 'white')
    projectiles = []
    enemies = []
    particles = []
    score = 0
    scoreId.innerHTML = score
    bigScore.innerHTML = score
}

function spawnEnemy(){
    setInterval(()=> {
        const radius = Math.random() * (30 - 6) + 6

        let x 
        let y

        if (Math.random() < 0.5){
             x  = Math.random()< 0.5 ? 0 - radius : canvas.width + radius
             y  = Math.random() * canvas.height
            // const y  = Math.random()< 0.5 ? 0 - radius : canvas.height + radius
        }else{
            
             x  = Math.random() * canvas.width
             y  = Math.random()< 0.5 ? 0 - radius : canvas.height + radius
        }
        
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`
        
        const angle = Math.atan2(canvas.height /2 - y,
             canvas.width / 2 - x)
        const velocity = {
            x: Math.cos(angle),
            y:Math.sin(angle)
        }

        // console.log(enemy)
        enemies.push(new Enemy(x, y, radius, color, velocity))
    }, 1000)
}

let animationId
let score = 0
function animate(){
    animationId = requestAnimationFrame(animate)
    context.fillStyle = 'rgba(0,0,0, 0.1)'
    context.fillRect(0,0, canvas.width, canvas.height)
    player.draw()
    particles.forEach((particle, index) => {
        if (particle.alpha <= 0){
            particles.splice(index, 1)
        }else{
            particle.update()
        }
        
    });
    projectiles.forEach((projectile, index) => {
        projectile.update()
        //remove from edges of the screen
        if (projectile.x - projectile.radius < 0 || projectile.x - projectile.radius > canvas.width || 
            projectile.y + projectile.radius < 0 || 
            projectile.y - projectile.radius > canvas.height){
            setTimeout(() =>{
               projectiles.splice(index, 1)
              },0)
        }
    })
    enemies.forEach((enemy, index)=>{
        enemy.update()
        const dist =  Math.hypot(player.x - enemy.x ,player.y - enemy.y )
        //end game
        if (dist - enemy.radius - player.radius < 1){
            cancelAnimationFrame(animationId)
            modalEl.style.display = 'flex'
            bigScore.innerHTML = score
        }
        projectiles.forEach((projectile, projectileIndex) => {
          const dist =  Math.hypot(projectile.x - enemy.x ,projectile.y - enemy.y )
        // when projectile touch enemy
          if (dist - enemy.radius - projectile.radius < 1){
              
              // create explosions
              for(let i =0; i < enemy.radius * 2; i++){
                  particles.push(new Particle(projectile.x, projectile.y,
                     Math.random()*2, enemy.color, 
                     {x: (Math.random()- 0.5) * (Math.random() * 6), y: (Math.random()- 0.5) * (Math.random() * 6)}))
              }
              if(enemy.radius - 10 > 5){
                  //increase score
                    score += 100
                    scoreId.innerHTML = score
                  gsap.to(enemy, {
                      radius: enemy.radius - 10
                  })
                  setTimeout(() =>{
                   
                    projectiles.splice(projectileIndex, 1)
                  },0)
              }else{
                  //remove from screen
                  
                score += 250
                scoreId.innerHTML = score
                setTimeout(() =>{
                    enemies.splice(index, 1)
                    projectiles.splice(projectileIndex, 1)
                  },0)
              }
              
              
                     
          }
        })
    })
}


window.addEventListener('click', (event)=> {  
    console.log(projectiles)  
    const angle = Math.atan2(event.clientY - canvas.height /2,
        event.clientX - canvas.width / 2)
    const velocity = {
        x: Math.cos(angle) * 5,
        y:Math.sin(angle) * 5
    }
    projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity,
    {
        x: 1,
        y: 1
    }))
})

startgamebtn.addEventListener('click',()=>{
    init()
    animate()
    spawnEnemy()
    modalEl.style.display = 'none'
} )

