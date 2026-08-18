# Projeto X Frontend

Interface React + Tailwind para a API em `../backend`.

## Executar

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

Configure `VITE_API_URL` e o UUID real da barbearia em `VITE_BARBERSHOP_ID`. A API atual exige esse UUID em serviços, profissionais e disponibilidade, mas não oferece endpoint público para descobrir uma barbearia; por isso ele precisa ser configurado no ambiente.

## Rotas

- `/`: homepage, catálogo e profissionais da API
- `/agendar`: serviço → profissional → data → horário → confirmação
- `/entrar`: login e cadastro
- `/minha-conta`: próximos horários, histórico, cancelamento e reagendamento

O token JWT fica no `localStorage`. Em produção, uma evolução recomendada é o backend emitir cookie `httpOnly`, acompanhado de proteção CSRF. Logout é local porque o backend usa JWT stateless e não mantém blacklist/refresh tokens.

## Lacunas atuais da API

- Não existe endpoint público de detalhes/listagem de barbearias; endereço, telefone, redes sociais e conteúdo institucional permanecem como placeholders.
- Não existe um identificador “qualquer profissional”. O frontend consulta os profissionais compatíveis e usa o primeiro com horário disponível.
- Não existem endpoints de recuperação de senha, refresh token ou revogação server-side.
- Pagamentos, favoritos, avaliações, galeria e notificações existem no banco, mas não possuem endpoints.
