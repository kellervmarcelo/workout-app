<template>
  <div class="flex flex-col items-center gap-4">
    <!-- Avatar Preview -->
    <div class="relative group">
      <div
        v-if="avatarUrl"
        class="h-24 w-24 rounded-full overflow-hidden ring-2 ring-muted"
      >
        <img :src="avatarUrl" alt="Avatar" class="h-full w-full object-cover">
      </div>
      <div
        v-else
        class="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 ring-2 ring-muted text-2xl font-semibold text-primary"
      >
        {{ initials }}
      </div>

      <!-- Upload overlay -->
      <label
        class="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
        :title="avatarUrl ? 'Trocar foto' : 'Adicionar foto'"
      >
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          class="hidden"
          @change="onFileSelected"
        >
      </label>
    </div>

    <!-- Loading/Error states -->
    <div v-if="uploading" class="text-sm text-muted-foreground flex items-center gap-2">
      <div class="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      Enviando...
    </div>
    <p v-if="error" class="text-sm text-destructive">
      {{ error }}
    </p>

    <!-- Remove button -->
    <Button
      v-if="avatarUrl && !uploading"
      variant="outline"
      size="sm"
      class="text-xs"
      @click="removeAvatar"
    >
      Remover foto
    </Button>

    <p class="text-xs text-muted-foreground">
      JPEG, PNG ou WebP. Máx. 2MB.
    </p>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  avatarUrl?: string
  initials: string
}>(), {
  avatarUrl: '',
})

const emit = defineEmits<{
  'update:avatarUrl': [value: string]
}>()

const supabase = useSupabaseClient()
const uploading = ref(false)
const error = ref('')

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

async function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file)
    return

  error.value = ''

  // Validate
  if (!ALLOWED_TYPES.includes(file.type)) {
    error.value = 'Formato inválido. Use JPEG, PNG ou WebP.'
    return
  }
  if (file.size > MAX_FILE_SIZE) {
    error.value = 'Arquivo muito grande. Máximo: 2MB.'
    return
  }

  uploading.value = true

  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user)
      throw new Error('Usuário não autenticado')

    const userId = session.user.id
    const ext = file.name.split('.').pop() || 'jpg'
    const fileName = `${Date.now()}.${ext}`
    const path = `${userId}/${fileName}`

    // Upload
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError)
      throw uploadError

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(path)

    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: urlData.publicUrl })
      .eq('id', userId)

    if (updateError)
      throw updateError

    // Delete old avatar if exists
    const oldPath = extractPathFromUrl(props.avatarUrl)
    if (oldPath) {
      await supabase.storage
        .from('avatars')
        .remove([oldPath])
    }

    emit('update:avatarUrl', urlData.publicUrl)
  }
  catch (err: any) {
    console.error('Erro ao fazer upload do avatar:', err)
    error.value = err.message || 'Erro ao enviar imagem'
  }
  finally {
    uploading.value = false
    // Reset input
    input.value = ''
  }
}

async function removeAvatar() {
  if (!props.avatarUrl)
    return

  error.value = ''
  uploading.value = true

  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user)
      throw new Error('Usuário não autenticado')

    // Delete from storage
    const path = extractPathFromUrl(props.avatarUrl)
    if (path) {
      await supabase.storage
        .from('avatars')
        .remove([path])
    }

    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: null })
      .eq('id', session.user.id)

    if (updateError)
      throw updateError

    emit('update:avatarUrl', '')
  }
  catch (err: any) {
    console.error('Erro ao remover avatar:', err)
    error.value = err.message || 'Erro ao remover imagem'
  }
  finally {
    uploading.value = false
  }
}

function extractPathFromUrl(url: string): string | null {
  if (!url)
    return null
  // Extract path from Supabase storage URL
  const match = url.match(/\/avatars\/(.+)$/)
  return match ? decodeURIComponent(match[1]) : null
}
</script>
