using Microsoft.AspNetCore.Cryptography.KeyDerivation;

namespace fbAPI.Models;

public class PasswordHasher
{
    public static string HashPassword(string password, byte[] salt)
    {
        // Хеширование пароля с солью
        var hashedPassword = KeyDerivation.Pbkdf2(
            password: password,
            salt: salt,
            prf: KeyDerivationPrf.HMACSHA256,
            iterationCount: 100000,
            numBytesRequested: 256 / 8);

        // Объединение соли и хэша в один бин массив
        var combined = new byte[salt.Length + hashedPassword.Length];
        Array.Copy(salt, 0, combined, 0, salt.Length);
        Array.Copy(hashedPassword, 0, combined, salt.Length, hashedPassword.Length);

        // Преобразование в строку для хранения
        return Convert.ToBase64String(combined);
    }

    public static bool VerifyPassword(string password, string hashedPassword)
    {
        var combinedBytes = Convert.FromBase64String(hashedPassword);
        var salt = new byte[128 / 8];
        Array.Copy(combinedBytes, 0, salt, 0, salt.Length);

        // Хеширование введенного пароля с солью
        var newHash = KeyDerivation.Pbkdf2(
            password: password,
            salt: salt,
            prf: KeyDerivationPrf.HMACSHA256,
            iterationCount: 100000,
            numBytesRequested: 256 / 8);

        // Сравнение хэшей
        var storedHash = new byte[combinedBytes.Length - salt.Length];
        Array.Copy(combinedBytes, salt.Length, storedHash, 0, storedHash.Length);
        return newHash.SequenceEqual(storedHash);
    }
}