<script lang="ts" setup>
import type { User } from '~~/models/user'

definePageMeta({
  middleware: ['sanctum:auth', 'sanctum:verified'],
})

useSeoMeta({
  title: 'Dashboard',
})

const { user } = useSanctumAuth<User>()
const sanctumFetch = useSanctumClient()

const echo = useNuxtApp().$echo

function subscribeToPublicChannel() {
  echo
    .channel('public')
    .listen(
      '.PublicEvent',
      (e: object) => {
        console.log('Public notification received:', e)
      },
    )
}

function subscribeToPrivateChannel() {
  echo
    .private(`users.${user.value!.id}`)
    .listen(
      '.PrivateEvent',
      (e: object) => {
        console.log('Private notification received:', e)
      },
    )
    .error((e: object) => {
      console.error('Private notification error:', e)
    })
}

function subscribeToPrivateSharedChannel() {
  echo
    .private(`users`)
    .listen(
      '.PrivateSharedEvent',
      (e: object) => {
        console.log('Private notification received:', e)
      },
    )
    .error((e: object) => {
      console.error('Private notification error:', e)
    })
}

async function triggerPublicEvent() {
  await sanctumFetch('/api/event/public', { method: 'post' })
}

async function triggerPrivateEvent() {
  await sanctumFetch('/api/event/private', { method: 'post' })
}

function stopAllListeners() {
  echo.leaveAllChannels()
}

onMounted(() => {
  subscribeToPublicChannel()
  subscribeToPrivateChannel()
  subscribeToPrivateSharedChannel()
})
</script>

<template>
  <UAlert
    title="You are logged in!"
    color="sky"
    variant="soft"
  />

  <UCard>
    <template #header>
      <h1>Welcome!</h1>
    </template>

    <div class="flex flex-col gap-2">
      <span>User details:</span>

      <code class="text-sm bg-gray-200 dark:bg-gray-200/10 p-2 rounded">
        {{ user }}
      </code>

      <div class="flex gap-2">
        <UButton
          class="w-fit"
          @click="subscribeToPublicChannel"
        >
          Subscribe to Public channel
        </UButton>

        <UButton
          class="w-fit"
          variant="outline"
          @click="triggerPublicEvent"
        >
          Trigger public event
        </UButton>
      </div>

      <div class="flex gap-2">
        <UButton
          class="w-fit"
          @click="subscribeToPrivateChannel"
        >
          Subscribe to Private channel
        </UButton>

        <UButton
          class="w-fit"
          @click="subscribeToPrivateSharedChannel"
        >
          Subscribe to Private Shared channel
        </UButton>

        <UButton
          class="w-fit"
          variant="outline"
          @click="triggerPrivateEvent"
        >
          Trigger private event
        </UButton>
      </div>

      <div class="flex gap-2">
        <UButton
          class="w-fit"
          variant="outline"
          @click="stopAllListeners"
        >
          Stop all listeners
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<style scoped></style>
