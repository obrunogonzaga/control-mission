# Contributing

Obrigado por contribuir com o Mission Control.

## Princípios

- Manter legibilidade para humanos e agentes.
- Evitar complexidade prematura no MVP.
- Tratar PRD e arquitetura como fonte de verdade.

## Antes de codar

1. Leia:
   - `docs/kick-off/mission-control-prd-v2.md`
   - `docs/kick-off/mission-control-architecture.md`
2. Se a mudança altera comportamento/contrato, atualize documentação no mesmo PR.
3. Se for decisão arquitetural, registre em ADR/changelog do documento de arquitetura.

## Fluxo de branches

- A branch `main` é protegida.
- É obrigatório trabalhar em branch para qualquer agente (Codex, Claude, OpenClaw e humanos).
- Nunca commitar direto na `main`.
- Padrão recomendado por agente:
  - `codex/onda-<N>-<slug>`
  - `claude/onda-<N>-<slug>`
  - `agent/<nome>/onda-<N>-<slug>`
- Tipos alternativos permitidos para contribuições humanas:
  - `feat/<descricao-curta>`
  - `fix/<descricao-curta>`
  - `docs/<descricao-curta>`
  - `chore/<descricao-curta>`

## Commits

Use mensagens objetivas (preferência por Conventional Commits):

- `feat: ...`
- `fix: ...`
- `docs: ...`
- `chore: ...`
- `refactor: ...`
- `test: ...`

## Pull Requests

Checklist mínimo:

- [ ] Escopo pequeno e focado
- [ ] Documentação atualizada (quando aplicável)
- [ ] Sem segredos/tokens no código
- [ ] Mudanças validadas localmente
- [ ] PR descreve o que mudou, por que mudou e riscos
- [ ] Status da onda atualizado em `docs/kick-off/mission-control-wave-plan.md`
- [ ] Entrada adicionada no `CHANGELOG.md`
- [ ] Se houve mudança de contrato/arquitetura, PRD e arquitetura foram atualizados

## Fechamento de ciclo (obrigatório)

Ao fechar um ciclo de trabalho (PR pronto para review), atualize:

1. `docs/kick-off/mission-control-wave-plan.md` (status da onda e registro de ciclo)
2. `CHANGELOG.md` (entrada da entrega)
3. docs funcionais/técnicos impactados (`mission-control-prd-v2.md`, `mission-control-architecture.md`, etc.)

## Diretrizes de código (resumo)

Back-end Go:

- Arquivos curtos (meta: até ~200 linhas)
- Nenhuma lógica de negócio em handlers
- Sem queries SQL fora de `db/queries/`
- Nunca ignorar `error`

Front-end:

- Componentes/hook em arquivos dedicados
- Lógica de dados em hooks, não em componentes de apresentação

## Segurança

- Nunca commite `.env` ou credenciais.
- Tokens e chaves sempre via variáveis de ambiente.
