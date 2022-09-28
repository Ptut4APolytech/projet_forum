<template>
  <div>
    <v-form ref="form">
      <v-text-field
          outlined
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          :type="showPassword ? 'text' : 'password'"
          prepend-inner-icon="mdi-lock"
          @click:append="showPassword = !showPassword"
          label="Nouveau mot de passe"
          v-model="password"
          :rules="[rules.passwordLength]"
          @input="inputConfirm"
      ></v-text-field>
      <v-text-field
          v-if="password"
          outlined
          :append-icon="showConfirm ? 'mdi-eye' : 'mdi-eye-off'"
          :type="showConfirm ? 'text' : 'password'"
          prepend-inner-icon="mdi-lock"
          @click:append="showConfirm = !showConfirm"
          label="Confirmer mot de passe"
          v-model="confirm"
          :rules="[rules.matchesPassword, rules.passwordLength]"
          @input="inputConfirm"
      ></v-text-field>
    </v-form>
  </div>
</template>

<script>
export default {
  name: "ChangePassword",
  data () {
    return {
      password: '',
      confirm: '',
      showPassword: false,
      showConfirm: false,
      rules: {
        passwordLength: value => value.length >= 8 || 'Le mot de passe doit au moins avoir 8 caractères',
        matchesPassword: value => value === this.password && value === this.confirm || 'Le mot de passe ne correspond pas'
      }
    }
  },
  methods: {
    inputConfirm (value) {
      this.$nextTick().then(() => {
        if (this.$refs.form.validate()) {
          this.$emit('updatePassword', value)
        }
      })
    }
  }
}
</script>

<style scoped>

</style>