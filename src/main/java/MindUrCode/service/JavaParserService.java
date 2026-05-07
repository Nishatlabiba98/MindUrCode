package MindUrCode.service;

import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.body.MethodDeclaration;
import MindUrCode.model.Method;
import MindUrCode.model.SourceFile;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class JavaParserService {

    public List<Method> extractMethods(File file, SourceFile sourceFile) throws IOException {
        List<Method> methods = new ArrayList<>();

        CompilationUnit cu = StaticJavaParser.parse(file);

        List<MethodDeclaration> declarations = cu.findAll(MethodDeclaration.class);

        for (MethodDeclaration declaration : declarations) {
            String name = declaration.getNameAsString();
            String body = declaration.toString();
            int lineStart = declaration.getBegin().map(pos -> pos.line).orElse(0);
            int lineEnd = declaration.getEnd().map(pos -> pos.line).orElse(0);
            String codeHash = String.valueOf(body.hashCode());

            Method method = Method.builder()
                    .methodName(name)
                    .rawCode(body)
                    .lineStart(lineStart)
                    .lineEnd(lineEnd)
                    .codeHash(codeHash)
                    .sourceFile(sourceFile)
                    .build();

            methods.add(method);
        }

        return methods;
    }
}
