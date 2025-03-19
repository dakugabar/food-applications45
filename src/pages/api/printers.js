import { exec } from "child_process";

export default function handler(req, res) {
  const command = `powershell -Command "Get-Printer | Select-Object Name, PortName"`;

  exec(command, (error, stdout) => {
    if (error) {
      console.error("Error fetching printer details:", error);
      return res.status(500).json({ error: "Failed to fetch printer details." });
    }

    // Process the output to extract printer names and ports
    const printers = stdout
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("Name")) // Skip the header line
      .map((line) => {
        const [name, port] = line.split(/\s{2,}/); // Split by two or more spaces
        return { name: name || "Unknown", port: port || "Unknown" };
      });

    // Filter out printers with name "----" or port "----"
    const filteredPrinters = printers.filter(
      (printer) => printer.name !== "----" && printer.port !== "----"
    );

    
    res.status(200).json({ printers: filteredPrinters });
  });
}
