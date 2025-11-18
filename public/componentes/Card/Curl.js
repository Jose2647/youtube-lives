~/.../Sites/youtube-lives $ curl -X POST http://localhost:3000/api/login -H "Content-Type: application/json" -d '{
      "email": "test@gmail.com",
      "senha": "123456"
    }'
{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc2MzIxNDc2OCwiZXhwIjoxNzYzMzAxMTY4fQ.uTWVphLETd3L_LR9hi5JaAgyODEjPJ15hiU_JejdYz4","user":{"conquistas":"latão","ultimoComprovantePix":null,"_id":"6916382e74ccc3d3c74bcfdf","id":1,"nome":"test","email":"test@gmail.com","imagem":"default-usuario.png","senha":"$2b$10$ibfYsLzhsmwO90pKwiiukeLs0r2HJnDFuE..7RZEn88AGY.4xmjB6","merito":500,"amigos":[],"__v":0}}~/.../Sites/youtube-l~/.../Sites/youtube-lives $



# PASSO 2: Enviar a estrutura COMPLETA para a rota POST /api/jogos
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc2MzIxNDc2OCwiZXhwIjoxNzYzMzAxMTY4fQ.uTWVphLETd3L_LR9hi5JaAgyODEjPJ15hiU_JejdYz4"

curl -X POST http://localhost:3000/api/jogos \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN" \
-d '[
      {
        "id": 1,
        "nome": "Grand Theft Auto V",
        "creatorId": 1,
        "estadios": [
          {
            "id": 1,
            "jogoId": 1,
            "nome": "Maracanã",
            "creatorId": 1,
            "times": [
              {
                "id": 1,
                "estadioId": 1,
                "nome": "Flamengo Esports",
                "creatorId": 1,
                "lives": [
                  {
                    "id": 1,
                    "timeId": 1,
                    "titulo": "Flamengo vs Vasco",
                    "creatorId": 1,
                    "divsHorizontais": [
                      {
                        "id": 1,
                        "liveId": 1,
                        "titulo": "Transmissão",
                        "creatorId": 1,
                        "cards": [
                          {
                            "id": 5,
                            "divHorizontalId": 1,
                            "titulo": "Card Atualizado via cURL",
                            "iframeUrl": "https://www.youtube.com/embed/NOVO-IFRAME-TESTE-FINAL",
                            "creatorId": 1
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]'
    
    
    
    
    
    

______compartilhar.js
signaling.on is not a function
_____intreterento
DOM carregado. Iniciando sequência de inicialização única...
🚀 Inicializando sistema completo...
🎯 Inicializando sistema de apostas e desafios...
Iniciando sistema...
🌐 Fetch chamado: http://localhost:3000/api/users undefined
🌐 Fetch chamado: http://localhost:3000/api/apostas undefined
🌐 Fetch chamado: http://localhost:3000/api/desafios undefined
🌐 Fetch chamado: http://localhost:3000/api/chats undefined
🌐 Fetch chamado: http://localhost:3000/api/jogos undefined
🔧 Inicializando ambiente de teste...
🔧 Inicializando dados de teste...
✅ Dados de teste inicializados
Dados salvos localmente.
___dados Object {jogos: Array(20), usuarios: Array(4), apostasUsuarios: Array(1), desafiosUsuarios: Array(1), chats: Array(6), …}
_____dados.jogos (20) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
Sistema inicializado com sucesso
✅ Sistema de apostas inicializado!
✅ Sistema completo inicializado!
✅ Sequência de inicialização do DOM concluída.
✅ Debug tools adicionadas
toggleTimeBotoes__>gerarHTMLCardTime
🔍 DEBUG salvarAlteracaoIframe INICIADO
- Item: Object {id: 5, titulo: "Card Atualizado via cURL", iframeUrl: "https://www.youtube.com/embed/u0z1QKTxIG4?mute=0&enablejsapi=1", creatorId: 1}
- Usuário logado: Object {id: 1, nome: "test", email: "test@gmail.com", token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc2MzIxNDc2OCwiZXhwIjoxNzYzMzAxMTY4fQ.uTWVphLETd3L_LR9hi5JaAgyODEjPJ15hiU_JejdYz4", merito: 500}
- Item creatorId: 1
- É o criador? true
Dados salvos localmente.
✅ Dados salvos no localStorage
🔄 Registrando iframe...
🌐 Fetch chamado: http://localhost:3000/api/iframe-registro POST
_____dados.jogos (20) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
Iframe registrado com sucesso: Object {msg: "Iframe registrado com sucesso"}
✅ Iframe registrado
🚀 SALVANDO NO BACKEND - Usuário é o criador!
📤 Enviando dados completos para /api/jogos...
🔍 DEBUG salvarDadosBackend INICIADO
✅ Token obtido do usuário logado
📤 Preparando requisição para /api/jogos
- URL: http://localhost:3000/api/jogos
- Método: POST
- Dados a enviar (primeiros 500 chars): [{"id":1,"nome":"Grand Theft Auto V","iframeUrl":"https://www.youtube.com/embed/QkkoHAzjnUs?autoplay=0&mute=1&controls=0","estadios":[{"id":1,"nome":"Maracanã","iframeUrl":"https://www.youtube.com/embed/ssrNcwxALS4?autoplay=0&mute=1&controls=0","times":[{"id":1,"nome":"Flamengo Esports","iframeUrl":"https://www.youtube.com/embed/ssrNcwxALS4?autoplay=0&mute=1&controls=0","lives":[{"id":1,"titulo":"Flamengo vs Vasco","status":"ao-vivo","creatorId":1,"iframeUrl":"https://www.youtube.com/embed/live_
- Número de jogos: 20
🌐 Fetch chamado: http://localhost:3000/api/jogos POST
📥 Resposta recebida:
- Status: 201
- OK: true
✅ Dados sincronizados com o backend: Object {msg: "Dados sincronizados com sucesso!", totalJogos: 20, atualizados: 0, inseridos: 0}
✅ Dados salvos no backend
🎉 Alteração de iframe processada
luna-console-testarToken()
🔐 TESTE DE TOKEN:
- Usuário logado: Object {id: 1, nome: "test", email: "test@gmail.com", token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc2MzIxNDc2OCwiZXhwIjoxNzYzMzAxMTY4fQ.uTWVphLETd3L_LR9hi5JaAgyODEjPJ15hiU_JejdYz4", merito: 500}
- Token existe? true
- Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc2MzIxNDc2OCwiZXhwIjoxNzYzMzAxMTY4fQ.uTWVphLETd3L_LR9hi5JaAgyODEjPJ15hiU_JejdYz4
🌐 Fetch chamado: http://localhost:3000/api/jogos GET
undefined
✅ Teste GET /api/jogos - Status: 200
✅ Dados recebidos: (20) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
0: "✅ Dados recebidos:"
1: Array(20)
0: Object
estadios: Array(1)
0: Object
id: 1
iframeUrl: "https://www.youtube.com/embed/ssrNcwxALS4?autoplay=0&mute=1&controls=0"
nome: "Maracanã"
times: Array(1)
__proto__: Object
length: 1
__proto__: Array(0)
id: 1
iframeUrl: "https://www.youtube.com/embed/QkkoHAzjnUs?autoplay=0&mute=1&controls=0"
nome: "Grand Theft Auto V"
__proto__: Object
1: Object
2: Object
3: Object
4: Object
5: Object
6: Object
7: Object
8: Object
9: Object
10: Object
11: Object
12: Object
13: Object
14: Object
15: Object
16: Object
17: Object
18: Object
19: Object
length: 20
__proto__: Array(0)
length: 2
__proto__: Array(0)