<template>
  <div style="width: 100px;">
    <div v-for="(time) in times" :key="time"
         class="subtitle-1 primary--text"
         style=" height: calc(8vh + 12px); font-weight: 300">
      {{ getFormatTime(time) }}
    </div>
  </div>
</template>

<script>

export default {
  name: 'AppointmentListTime',
  data: () => ({
    times: [14, 14.5, 15, 15.5, 16, 16.5, 17, 17.5, 18]
  }),
  methods: {
    getFormatTime (time) {
      return Math.trunc(time) + 'h' + ('' + ((time - Math.trunc(time)) * 60)).padStart(2, '0')
    }
  }
}
</script>
