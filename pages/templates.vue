<template>
  <div class="space-y-4 md:space-y-6">
    <!-- Header -->
    <div class="space-y-3 md:flex md:items-start md:justify-between md:space-y-0">
      <div>
        <div class="flex items-center gap-2">
          <NuxtLink to="/" class="text-muted-foreground hover:text-primary transition-colors min-h-[44px] flex items-center">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </NuxtLink>
          <div>
            <h1 class="text-xl font-bold tracking-tight md:text-3xl">
              Meus Templates
            </h1>
            <p class="text-sm text-muted-foreground mt-0.5">
              Templates para reutilizar
            </p>
          </div>
        </div>
      </div>
      <Button size="sm" class="w-full md:w-auto" @click="showCreateDialog = true">
        <svg class="w-4 h-4 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span class="hidden sm:inline">Novo Template</span>
        <span class="sm:hidden">Novo</span>
      </Button>
    </div>

    <!-- Create Dialog -->
    <Card v-if="showCreateDialog" class="p-4 md:p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold md:text-xl">
          Novo Template
        </h2>
        <Button variant="ghost" size="icon" class="h-9 w-9" @click="closeCreateDialog">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 mb-4 bg-muted rounded-lg p-1">
        <Button
          variant="ghost"
          size="sm"
          class="flex-1 text-sm"
          :class="createMode === 'manual' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'"
          @click="createMode = 'manual'"
        >
          <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Manual
        </Button>
        <Button
          variant="ghost"
          size="sm"
          class="flex-1 text-sm"
          :class="createMode === 'markdown' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'"
          @click="createMode = 'markdown'"
        >
          <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Markdown
        </Button>
      </div>

      <!-- Manual Mode -->
      <form v-if="createMode === 'manual'" class="space-y-4" @submit.prevent="createTemplate">
        <div class="space-y-2">
          <Label for="template-name" required>Nome</Label>
          <Input
            id="template-name"
            v-model="newTemplateName"
            placeholder="Ex: Treino A - Peito"
            required
            class="h-11 text-base"
          />
        </div>
        <div class="space-y-2">
          <Label for="template-description">Descrição (opcional)</Label>
          <Input
            id="template-description"
            v-model="newTemplateDescription"
            placeholder="Ex: Foco em hipertrofia"
            class="h-11 text-base"
          />
        </div>
        <div class="space-y-2">
          <Label for="template-comments">Comentários (opcional)</Label>
          <textarea
            id="template-comments"
            v-model="newTemplateComments"
            placeholder="Ex: Descansar 2min entre séries, focar na forma"
            rows="3"
            class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div class="flex gap-2">
          <Button type="button" variant="outline" class="flex-1" @click="closeCreateDialog">
            Cancelar
          </Button>
          <Button type="submit" class="flex-1">
            Criar Template
          </Button>
        </div>
      </form>

      <!-- Markdown Mode -->
      <div v-else class="space-y-4">
        <div class="space-y-2">
          <Label for="markdown-input">Colar Exercícios</Label>
          <textarea
            id="markdown-input"
            v-model="markdownInput"
            placeholder="Formato 1 — Markdown:&#10;### ** TREINO A **&#10;**Descrição**&#10;- [ ] Supino ......... 4x8&#10;&#10;Formato 2 — Lista com dash:&#10;Nome do treino&#10;Descrição&#10;- Supino 4x8&#10;- Rosca direta&#10;&#10;Formato 3 — Lista plain:&#10;Nome do treino&#10;Descrição&#10;Supino 4x8&#10;Rosca direta"
            rows="8"
            class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        <Button v-if="markdownInput.trim() && !parsedPreview" size="sm" class="w-full" @click="parseMarkdown">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Parsear Markdown
        </Button>

        <!-- Preview -->
        <div v-if="parsedPreview" class="space-y-3">
          <div class="text-xs text-muted-foreground space-y-1">
            <p v-if="parsedPreview.name">
              <strong>Nome:</strong> {{ parsedPreview.name }}
            </p>
            <p v-if="parsedPreview.description">
              <strong>Descrição:</strong> {{ parsedPreview.description }}
            </p>
          </div>

          <div class="space-y-1">
            <p class="text-xs font-medium text-muted-foreground">
              Exercícios ({{ parsedPreview.exercises.length }}):
            </p>
            <div
              v-for="(ex, idx) in parsedPreview.exercises"
              :key="idx"
              class="flex items-center gap-2 text-sm px-3 py-1.5 rounded-md bg-muted/50"
            >
              <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary">
                {{ idx + 1 }}
              </span>
              <span class="truncate flex-1">{{ ex.name }}</span>
              <span class="text-xs font-mono text-muted-foreground shrink-0">
                {{ ex.default_sets }}s × {{ ex.default_reps || 'tempo' }}{{ ex.default_reps ? ' reps' : '' }}
              </span>
            </div>
          </div>
          <p v-if="parsedPreview.comments" class="text-xs text-muted-foreground italic">
            Comentários: {{ parsedPreview.comments }}
          </p>

          <div class="flex gap-2">
            <Button variant="outline" size="sm" class="flex-1" @click="parsedPreview = null">
              Voltar
            </Button>
            <Button size="sm" class="flex-1" :disabled="parsedPreview.exercises.length === 0" @click="createFromMarkdown">
              Criar Template ({{ parsedPreview.exercises.length }} exercícios)
            </Button>
          </div>
        </div>
      </div>
    </Card>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p class="text-muted-foreground">
          Carregando...
        </p>
      </div>
    </div>

    <!-- Empty State -->
    <Card v-else-if="templates.length === 0" class="p-8 text-center md:p-12">
      <div class="text-5xl mb-4">
        📋
      </div>
      <h3 class="text-lg font-semibold mb-2 md:text-xl">
        Nenhum template ainda
      </h3>
      <p class="text-sm text-muted-foreground">
        Crie templates para reutilizar seus treinos!
      </p>
    </Card>

    <!-- Template List -->
    <div v-else class="space-y-3 md:space-y-4">
      <div
        v-for="template in templates"
        :key="template.id"
      >
        <Card
          class="p-4 transition-all duration-200 md:p-6"
          :class="activeTemplateId === template.id
            ? 'ring-2 ring-primary ring-offset-2 shadow-md'
            : 'hover:shadow-md'"
        >
          <div class="flex items-start justify-between gap-3">
            <div
              class="space-y-1.5 flex-1 min-w-0 cursor-pointer"
              :class="activeTemplateId === template.id ? '' : 'hover:opacity-80'"
              role="button"
              :aria-expanded="activeTemplateId === template.id"
              :aria-label="`Exercícios de ${template.name}`"
              @click="openTemplate(template.id)"
            >
              <div class="flex items-center gap-2 min-w-0">
                <!-- Chevron indicator -->
                <svg
                  class="w-4 h-4 shrink-0 transition-transform duration-200 text-muted-foreground"
                  :class="{ 'rotate-90': activeTemplateId === template.id }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
                <div class="flex items-center gap-1.5 min-w-0 flex-1">
                  <h3 class="text-sm font-semibold truncate md:text-lg">
                    {{ template.name }}
                  </h3>
                  <Badge
                    variant="outline"
                    class="font-mono text-[10px] shrink-0"
                    :class="activeTemplateId === template.id ? 'bg-primary/10 border-primary/30' : ''"
                  >
                    {{ totalExercises(template) }}
                  </Badge>
                </div>
              </div>
              <p v-if="template.description" class="text-xs text-muted-foreground truncate pl-6 md:text-sm">
                {{ template.description }}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              class="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
              @click.stop="deleteTemplate(template.id)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          </div>
        </Card>

        <!-- Template Detail Panel - slide down with distinct style -->
        <div
          v-if="activeTemplateId === template.id"
          class="overflow-hidden"
          style="animation: slideDown 0.3s ease-out"
        >
          <div class="ml-6 md:ml-8 mt-2 p-4 md:p-6 rounded-lg border-l-4 border-l-primary bg-muted/30 border border-t-0">
            <!-- Section header with distinct styling -->
            <div class="flex items-start justify-between gap-3 mb-5 pb-3 border-b border-border/50">
              <div class="flex items-start gap-3 min-w-0 flex-1">
                <svg class="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <div class="space-y-1 min-w-0 flex-1">
                  <!-- Title with edit -->
                  <div class="flex items-center gap-1.5">
                    <h2 v-if="editingTemplateId !== template.id" class="text-base font-semibold truncate md:text-lg">
                      {{ activeTemplate?.name }}
                    </h2>
                    <input
                      v-else
                      :value="activeTemplate?.name || ''"
                      class="text-sm font-semibold bg-background border border-input rounded px-2 py-0.5 min-w-[120px] md:text-base"
                      @blur="updateTemplateName(template.id, ($event.target as HTMLInputElement).value)"
                      @keydown.enter="($event.target as HTMLInputElement).blur()"
                      @click.stop
                    >
                    <Button
                      v-if="editingTemplateId !== template.id"
                      variant="ghost"
                      size="icon"
                      class="h-6 w-6 shrink-0 text-muted-foreground hover:text-primary"
                      @click.stop="editingTemplateId = template.id"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </Button>
                  </div>
                  <!-- Description with edit -->
                  <input
                    v-if="editingTemplateId === template.id"
                    :value="activeTemplate?.description || ''"
                    placeholder="Descrição (opcional)"
                    class="text-xs text-muted-foreground bg-background border border-input rounded px-2 py-1 w-full md:text-sm"
                    @blur="updateTemplateDescription(template.id, ($event.target as HTMLInputElement).value)"
                    @click.stop
                  >
                  <p v-else-if="activeTemplate?.description" class="text-xs text-muted-foreground md:text-sm">
                    {{ activeTemplate.description }}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" class="h-8 w-8 shrink-0" aria-label="Fechar painel" @click="activeTemplateId = null; editingTemplateId = null">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>

            <!-- Comments Section -->
            <div class="mb-5 p-3 rounded-md bg-background/60 border border-border/30">
              <div class="flex items-center gap-2 mb-2">
                <svg class="w-4 h-4 text-muted-foreground shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <Label for="template-comments-edit" class="text-sm font-medium">Comentários</Label>
              </div>
              <textarea
                id="template-comments-edit"
                :value="activeTemplate?.comments || ''"
                placeholder="Ex: Descansar 2min entre séries"
                rows="2"
                class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                @blur="updateTemplateComments(activeTemplateId!, ($event.target as HTMLTextAreaElement).value)"
              />
            </div>

            <!-- Separator: Comments vs Exercises -->
            <div class="mb-5 flex items-center gap-3">
              <div class="flex-1 h-px bg-border/50" />
              <svg class="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span class="text-sm font-semibold text-primary">Adicionar Exercícios</span>
              <div class="flex-1 h-px bg-border/50" />
            </div>

            <!-- Mode Toggle (inline panel) -->
            <div class="mb-5 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                :class="!showInlineMarkdown ? 'bg-primary text-primary-foreground' : ''"
                @click="showInlineMarkdown = false"
              >
                <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Individual
              </Button>
              <Button
                variant="outline"
                size="sm"
                :class="showInlineMarkdown ? 'bg-primary text-primary-foreground' : ''"
                @click="showInlineMarkdown = true"
              >
                <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Markdown
              </Button>
            </div>

            <!-- Markdown Import (inline panel) -->
            <div v-if="showInlineMarkdown" class="mb-6">
              <div class="flex items-center gap-2 mb-2">
                <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <Label class="text-sm font-medium">Colar Exercícios</Label>
              </div>
              <textarea
                v-model="inlineMarkdownInput"
                placeholder="Formato 1 — Markdown:&#10;### ** TREINO A **&#10;**Descrição**&#10;- [ ] Supino ......... 4x8&#10;&#10;Formato 2 — Lista com dash:&#10;Nome do treino&#10;Descrição&#10;- Supino 4x8&#10;- Rosca direta&#10;&#10;Formato 3 — Lista plain:&#10;Nome do treino&#10;Descrição&#10;Supino 4x8&#10;Rosca direta"
                rows="6"
                class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <div class="flex gap-2 mt-3">
                <Button size="sm" :disabled="!inlineMarkdownInput.trim()" @click="parseInlineMarkdown">
                  <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Importar
                </Button>
                <Button v-if="inlineParsedPreview" variant="outline" size="sm" @click="confirmInlineImport">
                  Confirmar ({{ inlineParsedPreview.exercises.length }} exercícios)
                </Button>
              </div>

              <!-- Preview -->
              <div v-if="inlineParsedPreview" class="mt-4 space-y-2">
                <p class="text-xs font-medium text-muted-foreground">
                  Preview:
                </p>
                <div
                  v-for="(ex, idx) in inlineParsedPreview.exercises"
                  :key="idx"
                  class="flex items-center gap-2 text-sm px-3 py-1.5 rounded-md bg-background/80 border border-border/50"
                >
                  <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary">
                    {{ idx + 1 }}
                  </span>
                  <span class="truncate flex-1">{{ ex.name }}</span>
                  <span class="text-xs font-mono text-muted-foreground shrink-0">
                    {{ ex.default_sets }}s × {{ ex.default_reps || 'tempo' }}{{ ex.default_reps ? ' reps' : '' }}
                  </span>
                </div>
                <p v-if="inlineParsedPreview.comments" class="text-xs text-muted-foreground italic">
                  Comentários: {{ inlineParsedPreview.comments }}
                </p>
              </div>
            </div>

            <!-- Add Exercise Form (hidden when markdown mode) -->
            <form v-if="!showInlineMarkdown" class="space-y-4 mb-6" @submit.prevent="addExercise">
              <div class="space-y-2">
                <Label for="exercise-name" required>Nome do Exercício</Label>
                <Input
                  id="exercise-name"
                  v-model="newExerciseName"
                  placeholder="Ex: Supino Reto"
                  required
                  class="h-10"
                />
              </div>
              <div class="grid grid-cols-3 gap-3">
                <div class="space-y-2">
                  <Label for="exercise-reps">Reps</Label>
                  <Input
                    id="exercise-reps"
                    v-model.number="newExerciseReps"
                    type="number"
                    min="1"
                    class="h-10 font-mono"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="exercise-sets">Séries</Label>
                  <Input
                    id="exercise-sets"
                    v-model.number="newExerciseSets"
                    type="number"
                    min="1"
                    class="h-10 font-mono"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="exercise-weight">Carga (kg)</Label>
                  <Input
                    id="exercise-weight"
                    v-model.number="newExerciseWeight"
                    type="number"
                    step="0.5"
                    min="0"
                    class="h-10 font-mono"
                  />
                </div>
              </div>
              <Button type="submit" size="sm" class="w-full md:w-auto">
                <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Adicionar
              </Button>
            </form>

            <!-- Exercises List -->
            <div v-if="activeTemplate?.exercises?.length" class="space-y-2">
              <div
                v-for="(exercise, idx) in activeTemplate.exercises"
                :key="exercise.id"
                class="group flex items-center justify-between gap-3 px-3 py-2.5 rounded-md bg-background/80 border border-border/50 hover:border-primary/30 hover:bg-background transition-colors"
              >
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    {{ idx + 1 }}
                  </span>
                  <div class="min-w-0">
                    <p class="font-medium text-sm truncate">
                      {{ exercise.name }}
                    </p>
                    <p class="text-xs text-muted-foreground font-mono">
                      {{ exercise.default_sets }}s × {{ exercise.default_reps }} reps × {{ exercise.default_weight_kg }} kg
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  aria-label="Remover exercício"
                  @click="deleteExercise(exercise.id)"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="text-center py-8">
              <svg class="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p class="text-sm font-medium text-muted-foreground">
                Nenhum exercício
              </p>
              <p class="text-xs text-muted-foreground/70 mt-1">
                Adicione exercícios ao template!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Session } from '@supabase/supabase-js'
import type { ParsedTemplate } from '~/composables/useMarkdownTemplate'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'YAFA — Templates' })

const supabase = useSupabaseClient()
const session = ref<Session | null>(null)
const templates = ref<WorkoutTemplateWithExercises[]>([])
const loading = ref(false)
const showCreateDialog = ref(false)
const newTemplateName = ref('')
const newTemplateDescription = ref('')
const newTemplateComments = ref('')

// Template detail state
const activeTemplateId = ref<string | null>(null)
const editingTemplateId = ref<string | null>(null)
const newExerciseName = ref('')
const newExerciseReps = ref(10)
const newExerciseSets = ref(3)
const newExerciseWeight = ref(0)

// Create dialog state
const createMode = ref<'manual' | 'markdown'>('manual')

// Markdown import state (for create dialog)
const markdownInput = ref('')
const parsedPreview = ref<ParsedTemplate | null>(null)

// Inline markdown state (for existing template panel)
const showInlineMarkdown = ref(false)
const inlineMarkdownInput = ref('')
const inlineParsedPreview = ref<ParsedTemplate | null>(null)

const activeTemplate = computed(() => {
  if (!activeTemplateId.value)
    return null
  return templates.value.find(t => t.id === activeTemplateId.value) || null
})

onMounted(async () => {
  const { data } = await supabase.auth.getSession()
  session.value = data.session

  supabase.auth.onAuthStateChange((_event, newSession) => {
    session.value = newSession
  })

  if (!data.session) {
    navigateTo('/login')
    return
  }

  await fetchTemplates()
})

async function fetchTemplates() {
  if (!session.value?.user)
    return

  loading.value = true
  try {
    const { data, error } = await supabase
      .from('workout_templates')
      .select(`
        *,
        exercises:template_exercises(*)
      `)
      .eq('user_id', session.value.user.id)
      .order('created_at', { ascending: false })

    if (error)
      throw error
    templates.value = data || []
  }
  catch (error: any) {
    console.error('Erro ao buscar templates:', error)
  }
  finally {
    loading.value = false
  }
}

async function createTemplate() {
  if (!session.value?.user || !newTemplateName.value)
    return

  try {
    const { data, error } = await supabase
      .from('workout_templates')
      .insert({
        user_id: session.value.user.id,
        name: newTemplateName.value,
        description: newTemplateDescription.value || null,
        comments: newTemplateComments.value || null,
      })
      .select()
      .single()

    if (error)
      throw error

    showCreateDialog.value = false
    newTemplateName.value = ''
    newTemplateDescription.value = ''
    newTemplateComments.value = ''

    await fetchTemplates()

    // Abre o template recém-criado automaticamente
    if (data?.id) {
      activeTemplateId.value = data.id
    }
  }
  catch (error: any) {
    console.error('Erro ao criar template:', error)
  }
}

async function deleteTemplate(id: string) {
  try {
    const { error } = await supabase.from('workout_templates').delete().eq('id', id)
    if (error)
      throw error
    if (activeTemplateId.value === id)
      activeTemplateId.value = null
    await fetchTemplates()
  }
  catch (error: any) {
    console.error('Erro ao deletar template:', error)
  }
}

function totalExercises(template: WorkoutTemplateWithExercises) {
  return template.exercises?.length || 0
}

function openTemplate(id: string) {
  if (activeTemplateId.value === id)
    activeTemplateId.value = null
  else
    activeTemplateId.value = id
}

async function addExercise() {
  if (!activeTemplateId.value || !newExerciseName.value)
    return

  const template = activeTemplate.value
  if (!template)
    return

  const order = template.exercises?.length || 0

  try {
    const { error } = await supabase
      .from('template_exercises')
      .insert({
        template_id: activeTemplateId.value,
        name: newExerciseName.value,
        order,
        default_reps: newExerciseReps.value,
        default_sets: newExerciseSets.value,
        default_weight_kg: newExerciseWeight.value,
      })

    if (error)
      throw error

    newExerciseName.value = ''
    newExerciseReps.value = 10
    newExerciseSets.value = 3
    newExerciseWeight.value = 0

    // Recarrega apenas o template ativo
    await fetchTemplates()
  }
  catch (error: any) {
    console.error('Erro ao adicionar exercício:', error)
  }
}

async function deleteExercise(exerciseId: string) {
  try {
    const { error } = await supabase.from('template_exercises').delete().eq('id', exerciseId)
    if (error)
      throw error
    await fetchTemplates()
  }
  catch (error: any) {
    console.error('Erro ao deletar exercício:', error)
  }
}

async function updateTemplateComments(templateId: string, comments: string) {
  try {
    const { error } = await supabase
      .from('workout_templates')
      .update({ comments: comments || null })
      .eq('id', templateId)

    if (error)
      throw error
    editingTemplateId.value = null
    await fetchTemplates()
  }
  catch (error: any) {
    console.error('Erro ao atualizar comentários:', error)
  }
}

async function updateTemplateName(templateId: string, name: string) {
  const trimmed = name.trim()
  if (!trimmed)
    return

  try {
    const { error } = await supabase
      .from('workout_templates')
      .update({ name: trimmed })
      .eq('id', templateId)

    if (error)
      throw error
    editingTemplateId.value = null
    await fetchTemplates()
  }
  catch (error: any) {
    console.error('Erro ao atualizar nome:', error)
  }
}

async function updateTemplateDescription(templateId: string, description: string) {
  try {
    const { error } = await supabase
      .from('workout_templates')
      .update({ description: description.trim() || null })
      .eq('id', templateId)

    if (error)
      throw error
    editingTemplateId.value = null
    await fetchTemplates()
  }
  catch (error: any) {
    console.error('Erro ao atualizar descrição:', error)
  }
}

function closeCreateDialog() {
  showCreateDialog.value = false
  createMode.value = 'manual'
  newTemplateName.value = ''
  newTemplateDescription.value = ''
  newTemplateComments.value = ''
  markdownInput.value = ''
  parsedPreview.value = null
}

function parseMarkdown() {
  if (!markdownInput.value.trim())
    return

  const { parse } = useMarkdownTemplate()
  parsedPreview.value = parse(markdownInput.value)
}

async function createFromMarkdown() {
  if (!parsedPreview.value || !session.value?.user)
    return

  try {
    const { data, error } = await supabase
      .from('workout_templates')
      .insert({
        user_id: session.value.user.id,
        name: parsedPreview.value.name || 'Template sem nome',
        description: parsedPreview.value.description || null,
        comments: parsedPreview.value.comments || null,
      })
      .select()
      .single()

    if (error)
      throw error

    for (let i = 0; i < parsedPreview.value.exercises.length; i++) {
      const ex = parsedPreview.value.exercises[i]
      const { error: exError } = await supabase
        .from('template_exercises')
        .insert({
          template_id: data.id,
          name: ex.name,
          order: i,
          default_reps: ex.default_reps,
          default_sets: ex.default_sets,
          default_weight_kg: ex.default_weight_kg,
        })

      if (exError)
        throw exError
    }

    closeCreateDialog()
    await fetchTemplates()
    if (data?.id) {
      activeTemplateId.value = data.id
    }
  }
  catch (error: any) {
    console.error('Erro ao criar template via markdown:', error)
  }
}

// Inline markdown functions
function parseInlineMarkdown() {
  if (!inlineMarkdownInput.value.trim())
    return

  const { parse } = useMarkdownTemplate()
  inlineParsedPreview.value = parse(inlineMarkdownInput.value)
}

async function confirmInlineImport() {
  if (!inlineParsedPreview.value || !activeTemplateId.value)
    return

  try {
    if (inlineParsedPreview.value.description || inlineParsedPreview.value.comments) {
      const updates: Record<string, string | null> = {}
      if (inlineParsedPreview.value.description)
        updates.description = inlineParsedPreview.value.description
      if (inlineParsedPreview.value.comments)
        updates.comments = inlineParsedPreview.value.comments

      const { error: updateError } = await supabase
        .from('workout_templates')
        .update(updates)
        .eq('id', activeTemplateId.value)

      if (updateError)
        throw updateError
    }

    const existingExercises = activeTemplate.value?.exercises || []
    for (let i = 0; i < inlineParsedPreview.value.exercises.length; i++) {
      const ex = inlineParsedPreview.value.exercises[i]
      const { error } = await supabase
        .from('template_exercises')
        .insert({
          template_id: activeTemplateId.value,
          name: ex.name,
          order: existingExercises.length + i,
          default_reps: ex.default_reps,
          default_sets: ex.default_sets,
          default_weight_kg: ex.default_weight_kg,
        })

      if (error)
        throw error
    }

    inlineMarkdownInput.value = ''
    inlineParsedPreview.value = null
    showInlineMarkdown.value = false
    await fetchTemplates()
  }
  catch (error: any) {
    console.error('Erro ao importar markdown:', error)
  }
}
</script>

<style scoped>
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
