package MindUrCode.Repository;

// =====================================================================
// MethodRepo.java  –  JPA Repository for the Method entity
// =====================================================================
//
// WHAT IS A JPA REPOSITORY?
//   Spring Data JPA lets you define an interface that extends
//   JpaRepository<EntityType, IdType>. Spring automatically creates
//   the implementation at runtime — you never write SQL or JDBC code.
//
// WHAT IS JpaRepository?
//   It already gives you for free:
//     save(method)              – insert or update a row
//     findById(id)              – find one row by primary key
//     findAll()                 – get every row in the table
//     delete(method)            – remove a row
//     count()                   – how many rows exist
//   You only need to declare the EXTRA queries your app needs.
//
// NAMING RULES FOR CUSTOM QUERIES
//   Spring reads your method name and generates the SQL automatically.
//   Pattern:  findBy<FieldName>(<value>)
//   Examples:
//     findBySourceFileId(UUID id)  →  SELECT * FROM method WHERE source_file_id = ?
//     findByCodeHash(String hash)  →  SELECT * FROM method WHERE code_hash = ?
//
// =====================================================================

import MindUrCode.Entity.Method;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

// @Repository  tells Spring this is a data-access component.
// Spring will create a real implementation of this interface
// automatically — you do not write a class body.
@Repository
public interface MethodRepo extends JpaRepository<Method, UUID> {

    // -----------------------------------------------------------------
    // findBySourceFileId
    // -----------------------------------------------------------------
    // PURPOSE:
    //   Get every method that belongs to a specific source file.
    //   Used when a SourceFile has been parsed and we want all of its
    //   declared methods (e.g., to run an analysis tool on each one).
    //
    // HOW IT WORKS:
    //   Spring reads "SourceFileId" in the method name, looks for a
    //   field called sourceFileId on the Method entity, and generates:
    //     SELECT * FROM method WHERE source_file_id = ?
    //
    // RETURN TYPE — List<Method>:
    //   Returns zero or more results.
    //   If the file has no methods, you get an empty list (not null).
    //
    // EXAMPLE USAGE:
    //   List<Method> methods = methodRepo.findBySourceFileId(fileId);
    //   methods.forEach(m -> System.out.println(m.getMethodName()));
    // -----------------------------------------------------------------
    List<Method> findBySourceFileId(UUID sourceFileId);

    // -----------------------------------------------------------------
    // findByCodeHash
    // -----------------------------------------------------------------
    // PURPOSE:
    //   Look up a method by its content hash.
    //   A "code hash" is a fingerprint of the raw source code text.
    //   Two methods with identical code will have the same hash,
    //   so this is used to detect duplicate / copy-pasted methods
    //   and to avoid re-analyzing code we have already seen.
    //
    // HOW IT WORKS:
    //   Spring reads "CodeHash" from the name and generates:
    //     SELECT * FROM method WHERE code_hash = ?
    //
    // RETURN TYPE — Optional<Method>:
    //   Optional is Java's way of saying "this might not exist."
    //   Use it instead of returning null, which causes NullPointerExceptions.
    //
    //   HOW TO USE Optional:
    //     Optional<Method> result = methodRepo.findByCodeHash(hash);
    //
    //     // Safe way — only runs if a method was found:
    //     result.ifPresent(m -> System.out.println("Found: " + m.getMethodName()));
    //
    //     // Get the value or a default:
    //     Method m = result.orElse(null);
    //
    //     // Check if it exists:
    //     if (result.isPresent()) { ... }
    // -----------------------------------------------------------------
    Optional<Method> findByCodeHash(String codeHash);
}