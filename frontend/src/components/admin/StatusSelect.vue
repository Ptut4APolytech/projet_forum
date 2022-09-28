<template>
  <div>
<!--    <v-select-->
<!--        v-if="status !== 'validated'"-->
<!--        :items="items"-->
<!--        @change="(value) => {$emit('change', value)}"-->
<!--        :value="status"-->
<!--    >-->
<!--      &lt;!&ndash;      v-model="status"&ndash;&gt;-->
<!--      prepend-inner-->
<!--      <template v-slot:item="{ item }">-->
<!--        <div class="statusPoint mr-5" :class="getColor(item)"/>-->
<!--        {{ getLabel(item) }}-->
<!--      </template>-->
<!--      <template v-slot:selection="{ item }">-->
<!--        <div class="statusPoint mr-4" :class="getColor(item)"/>-->
<!--        {{ getLabel(item) }}-->
<!--      </template>-->
<!--    </v-select>-->
    <div class="d-flex align-center subtitle-1">
      <div class="statusPoint mr-4" :class="getColor(status)"/>
      {{ getLabel(status) }}
    </div>
  </div>
</template>

<script>


export default {
  name: 'StatusSelect',
  props: ['status'],
  data: () => ({
    items: ['waiting', 'validated', 'notValidated']
  }),
  methods: {
    getColor (status) {
      switch (status) {
        case 'validated':
          return 'success'
        case 'waiting':
          return 'tertiary'
        case 'notValidated':
          return 'error'
      }
    },
    getLabel (status) {
      switch (status) {
        case 'validated':
          return 'Valide'
        case 'waiting':
          return 'En attente'
        case 'notValidated':
          return 'Invalide'
      }
    }
  }
}
</script>

<style>
.statusPoint {
  width: 17px;
  height: 17px;
  border-radius: 20px;
  margin: 6px;
}

.statusPoint.red {
  background-color: red;
}

.statusPoint.orange {
  background-color: orange;
}

.statusPoint.green {
  background-color: green;
}

</style>
