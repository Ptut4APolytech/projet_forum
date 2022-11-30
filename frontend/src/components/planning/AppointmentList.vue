<template>
  <div style="width: 219px; border-right: solid #D1E8E8 1px">
    <div v-for="(i, index) in 8" :key="index" :appointment="appointments[index]"
         style=" height: calc(8vh + 12px); width: calc(207px + 12px); border-bottom: solid #D1E8E8 1px; padding: 6px; "
         :style="index === 0 ? ' border-top: solid #D1E8E8 1px; ' : ''">
      <appointment-tile @delete="$emit('delete', appointments[index])" v-if="appointments[index]"
                        :appointment="appointments[index]" :students="students" :companies="companies" :offers="offers"
                        :mode="mode"></appointment-tile>
      <empty-tile v-else @addAppo="$emit('addAppo', index)"></empty-tile>
    </div>
  </div>
</template>

<script>
import AppointmentTile from '../planning/AppointmentTile'
import EmptyTile from '../planning/EmptyTile'

export default {
  name: 'AppointmentList',
  props: ['appointments', 'students', 'companies', 'offers', 'mode'],
  components: {AppointmentTile, EmptyTile},
  data: () => ({}),
  created () {
  }
}
</script>
