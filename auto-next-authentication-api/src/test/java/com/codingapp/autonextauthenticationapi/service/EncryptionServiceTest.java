package com.codingapp.autonextauthenticationapi.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class EncryptionServiceTest {

    private EncryptionService encryptionService;

    @BeforeEach
    void setUp() {
        // Use a test encryption key (32 bytes for AES-256)
        encryptionService = new EncryptionService("testEncryptionKey12345678901234");
    }

    @Test
    void encrypt_shouldProduceDifferentOutputFromInput() {
        // given
        String plainText = "12345678901"; // Sample Tax ID

        // when
        String encrypted = encryptionService.encrypt(plainText);

        // then
        assertThat(encrypted).isNotNull();
        assertThat(encrypted).isNotEqualTo(plainText);
        assertThat(encrypted).isNotEmpty();
    }

    @Test
    void decrypt_shouldReturnOriginalPlaintext() {
        // given
        String originalText = "SensitiveData123";
        String encrypted = encryptionService.encrypt(originalText);

        // when
        String decrypted = encryptionService.decrypt(encrypted);

        // then
        assertThat(decrypted).isEqualTo(originalText);
    }

    @Test
    void encrypt_shouldProduceDifferentCiphertextForSameInput() {
        // given - AES-GCM uses random IV, so same input should produce different
        // ciphertext
        String plainText = "TestTaxId12345";

        // when
        String encrypted1 = encryptionService.encrypt(plainText);
        String encrypted2 = encryptionService.encrypt(plainText);

        // then - Both should decrypt to same value but be different ciphertext
        assertThat(encrypted1).isNotEqualTo(encrypted2);
        assertThat(encryptionService.decrypt(encrypted1)).isEqualTo(plainText);
        assertThat(encryptionService.decrypt(encrypted2)).isEqualTo(plainText);
    }

    @Test
    void encrypt_shouldHandleNullAndEmptyInput() {
        // given & when & then
        assertThat(encryptionService.encrypt(null)).isNull();
        assertThat(encryptionService.encrypt("")).isEmpty();
        assertThat(encryptionService.decrypt(null)).isNull();
        assertThat(encryptionService.decrypt("")).isEmpty();
    }

    @Test
    void decrypt_shouldThrowExceptionForInvalidCiphertext() {
        // given
        String invalidCiphertext = "notAValidBase64CipherText!!!";

        // when & then
        assertThatThrownBy(() -> encryptionService.decrypt(invalidCiphertext))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Decryption failed");
    }
}
